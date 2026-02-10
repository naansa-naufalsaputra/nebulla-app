#!/usr/bin/env python3
"""
Skill: webapp-testing
Script: playwright_runner.py
Purpose: Run Playwright tests (full suite if config exists, else basic check)
Usage: python playwright_runner.py <url> [--screenshot]
Output: JSON with test results
"""
import sys
import json
import os
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path

# Fix Windows console encoding for Unicode output
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except AttributeError:
    pass  # Python < 3.7

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False


def run_full_suite(project_path: str, url: str) -> dict:
    """Run full Playwright test suite using npx."""
    print(f"Playwright config detected. Running full suite...", file=sys.stderr)
    
    # Use npx.cmd on Windows
    npx_cmd = "npx.cmd" if sys.platform == "win32" else "npx"
    cmd = [npx_cmd, "playwright", "test", "--reporter=json"]
    # Pass URL as env var if needed, though config usually handles it
    env = os.environ.copy()
    if url:
        env["PLAYWRIGHT_TEST_BASE_URL"] = url
        
    try:
        # Run test
        result = subprocess.run(
            cmd,
            cwd=project_path,
            env=env,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        # Parse JSON report
        try:
            report = json.loads(result.stdout)
            passed = result.returncode == 0
            
            stats = report.get("stats", {})
            summary = f"Tests: {stats.get('expected', 0)}, Passed: {stats.get('expected', 0) - stats.get('unexpected', 0)}, Failed: {stats.get('unexpected', 0)}"
            
            return {
                "url": url,
                "mode": "full_suite",
                "status": "success" if passed else "failed",
                "summary": summary,
                "details": report
            }
        except json.JSONDecodeError:
            # Fallback if no JSON (e.g. fatal error)
            return {
                "url": url,
                "mode": "full_suite",
                "status": "failed",
                "summary": "Failed to parse test report",
                "output": result.stdout + result.stderr
            }
            
    except Exception as e:
         return {
            "url": url,
            "mode": "full_suite",
            "status": "error",
            "error": str(e)
        }

def run_basic_test(url: str, take_screenshot: bool = False) -> dict:
    """Run basic browser test on URL."""
    if not PLAYWRIGHT_AVAILABLE:
        return {
            "error": "Playwright not installed",
            "fix": "pip install playwright && playwright install chromium"
        }
    
    result = {
        "url": url,
        "timestamp": datetime.now().isoformat(),
        "status": "pending"
    }
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={"width": 1280, "height": 720},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            )
            page = context.new_page()
            
            # Navigate
            response = page.goto(url, wait_until="domcontentloaded", timeout=30000)
            
            # Basic info
            result["page"] = {
                "title": page.title(),
                "url": page.url,
                "status_code": response.status if response else None
            }
            
            # Health checks
            result["health"] = {
                "loaded": response.ok if response else False,
                "has_title": bool(page.title()),
                "has_h1": page.locator("h1").count() > 0,
                "has_links": page.locator("a").count() > 0,
                "has_images": page.locator("img").count() > 0
            }
            
            # Console errors
            console_errors = []
            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
            
            # Performance metrics
            try:
                result["performance"] = {
                    "dom_content_loaded": page.evaluate("window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart"),
                    "load_complete": page.evaluate("window.performance.timing.loadEventEnd - window.performance.timing.navigationStart")
                }
            except:
                result["performance"] = {}
            
            # Screenshot - uses system temp directory (cross-platform, auto-cleaned)
            if take_screenshot:
                # Cross-platform: Windows=%TEMP%, Linux/macOS=/tmp
                screenshot_dir = os.path.join(tempfile.gettempdir(), "maestro_screenshots")
                os.makedirs(screenshot_dir, exist_ok=True)
                screenshot_path = os.path.join(screenshot_dir, f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png")
                page.screenshot(path=screenshot_path, full_page=True)
                result["screenshot"] = screenshot_path
                result["screenshot_note"] = "Saved to temp directory (auto-cleaned by OS)"
            
            # Element counts
            result["elements"] = {
                "links": page.locator("a").count(),
                "buttons": page.locator("button").count(),
                "inputs": page.locator("input").count(),
                "images": page.locator("img").count(),
                "forms": page.locator("form").count()
            }
            
            browser.close()
            
            result["status"] = "success" if result["health"]["loaded"] else "failed"
            result["summary"] = "[OK] Page loaded successfully" if result["status"] == "success" else "[X] Page failed to load"
            
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        result["summary"] = f"[X] Error: {str(e)[:100]}"
    
    return result


def run_accessibility_check(url: str) -> dict:
    """Run basic accessibility check."""
    if not PLAYWRIGHT_AVAILABLE:
        return {"error": "Playwright not installed"}
    
    result = {"url": url, "accessibility": {}}
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            
            # Basic a11y checks
            result["accessibility"] = {
                "images_with_alt": page.locator("img[alt]").count(),
                "images_without_alt": page.locator("img:not([alt])").count(),
                "buttons_with_label": page.locator("button[aria-label], button:has-text('')").count(),
                "links_with_text": page.locator("a:has-text('')").count(),
                "form_labels": page.locator("label").count(),
                "headings": {
                    "h1": page.locator("h1").count(),
                    "h2": page.locator("h2").count(),
                    "h3": page.locator("h3").count()
                }
            }
            
            browser.close()
            result["status"] = "success"
            
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
    
    return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: python playwright_runner.py <url> [--screenshot] [--a11y]",
            "examples": [
                "python playwright_runner.py https://example.com",
                "python playwright_runner.py https://example.com --screenshot",
                "python playwright_runner.py https://example.com --a11y"
            ]
        }, indent=2))
        sys.exit(1)
    
    # Arg parsing logic to support both standalone and verify_all.py usage
    # verify_all.py calls: python runner.py <project_path> <url>
    # Standalone calls: python runner.py <url>
    
    arg1 = sys.argv[1]
    
    # Check if we have a second argument that looks like a URL
    if len(sys.argv) > 2 and not sys.argv[2].startswith("--"):
        project_path = arg1
        url = sys.argv[2]
        # Shift args for flag checking
        args_start_idx = 3
    else:
        # Standalone usage
        url = arg1
        project_path = os.getcwd()
        args_start_idx = 2
        
    take_screenshot = "--screenshot" in sys.argv[args_start_idx:]
    check_a11y = "--a11y" in sys.argv[args_start_idx:]
    
    config_exists = (Path(project_path) / "playwright.config.ts").exists() or \
                   (Path(project_path) / "playwright.config.js").exists()
    
    if check_a11y:
        result = run_accessibility_check(url)
    elif config_exists and not take_screenshot: # Prefer full suite if available and not explicitly asking for screenshot
        result = run_full_suite(project_path, url)
    else:
        result = run_basic_test(url, take_screenshot)
    
    print(json.dumps(result, indent=2))
