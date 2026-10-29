import ipaddress
import socket
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup
from fastapi import HTTPException
from app.models.campaign import SafeUrlFetchResponse
from app.utils.text_cleaner import count_words

DISALLOWED_IP_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]

def validate_url_safe(url: str) -> None:
    """Validates that a URL does not target localhost, private IPs, or unsafe schemes (SSRF Protection)."""
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid URL scheme '{parsed.scheme}'. Only http:// and https:// URLs are permitted."
        )
    
    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="URL is missing a valid hostname.")

    # Reject localhost directly
    if hostname.lower() in ("localhost", "127.0.0.1", "::1", "0.0.0.0"):
        raise HTTPException(
            status_code=400,
            detail="Fetching from localhost or loopback addresses is prohibited for security reasons."
        )

    # Resolve IP addresses
    try:
        addr_info = socket.getaddrinfo(hostname, None)
    except socket.gaierror:
        raise HTTPException(
            status_code=400,
            detail=f"Could not resolve hostname '{hostname}'. Please check spelling or connectivity."
        )

    for item in addr_info:
        ip_str = item[4][0]
        ip_obj = ipaddress.ip_address(ip_str)
        for net in DISALLOWED_IP_NETWORKS:
            if ip_obj in net:
                raise HTTPException(
                    status_code=400,
                    detail=f"Access to private or local network address ({ip_str}) is prohibited."
                )

async def fetch_url_content(url: str) -> SafeUrlFetchResponse:
    """Safely retrieves public web content and extracts main readable text."""
    validate_url_safe(url)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 SocialContentRepurposer/1.0"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, max_redirects=3) as client:
            resp = await client.get(url, headers=headers)
            
            # Post-redirect check
            validate_url_safe(str(resp.url))

            if resp.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail=f"Remote server returned HTTP status {resp.status_code}. Content could not be retrieved."
                )

            # Limit content size to 5MB
            if len(resp.content) > 5 * 1024 * 1024:
                raise HTTPException(
                    status_code=400,
                    detail="Remote page size exceeds the 5MB maximum safe download limit."
                )

            html_text = resp.text

    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timed out while connecting to the specified URL.")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=400, detail=f"Network error while connecting to URL: {str(exc)}")

    # Parse and extract text
    soup = BeautifulSoup(html_text, "html.parser")

    # Remove script, style, nav, footer, header tags
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "svg", "iframe"]):
        tag.decompose()

    # Extract title
    title = ""
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    elif soup.find("h1"):
        title = soup.find("h1").get_text().strip()
    else:
        title = "Extracted Web Article"

    # Prefer main or article tag if present
    main_elem = soup.find("article") or soup.find("main") or soup.body or soup
    raw_text = main_elem.get_text(separator="\n\n")

    # Clean text lines
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    cleaned_content = "\n\n".join(lines)

    if len(cleaned_content) < 100:
        raise HTTPException(
            status_code=400,
            detail="The target webpage contains insufficient readable text (under 100 characters). Please paste the source text directly."
        )

    return SafeUrlFetchResponse(
        title=title,
        text_content=cleaned_content[:50000],
        url=url,
        word_count=count_words(cleaned_content)
    )

