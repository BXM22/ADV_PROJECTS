#!/usr/bin/env python3
"""
Reddit media scraper.

Downloads images and Reddit-hosted videos from a subreddit without logging in.
Offers both CLI and GUI interfaces.

Setup:
    pip install requests tqdm

Usage:
    # CLI mode
    python reddit.py pics --limit 50 --sort top

    # GUI mode
    python reddit.py --gui
"""

from __future__ import annotations

import argparse
import queue
import pathlib
import re
import sys
import threading
from typing import Callable, Iterable, Optional

import requests
from tqdm import tqdm


REDDIT_BASE = "https://www.reddit.com"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
VALID_SORTS = {"hot", "new", "top", "rising"}
DEFAULT_USER_AGENT = "reddit-media-scraper/0.1 (by u/your_username)"
SAFE_FILENAME_RE = re.compile(r"[^a-zA-Z0-9._-]+")


def sanitize_filename(name: str) -> str:
    name = SAFE_FILENAME_RE.sub("_", name).strip("._")
    return name or "reddit_media"


def ensure_directory(base_path: pathlib.Path, subreddit: str) -> pathlib.Path:
    target = base_path / sanitize_filename(subreddit)
    target.mkdir(parents=True, exist_ok=True)
    return target


def fetch_submissions(
    subreddit_name: str,
    sort: str,
    limit: int,
    user_agent: str,
) -> Iterable[dict]:
    headers = {
        "User-Agent": user_agent,
        "Accept": "application/json",
    }
    url = f"{REDDIT_BASE}/r/{subreddit_name}/{sort}.json"
    items: list[dict] = []
    after: Optional[str] = None
    remaining = limit

    while remaining > 0:
        batch_limit = min(remaining, 100)
        params = {"limit": batch_limit}
        if after:
            params["after"] = after
        response = requests.get(url, headers=headers, params=params, timeout=30)
        if response.status_code == 429:
            raise SystemExit("Rate limited by Reddit. Try again later or slow down requests.")
        response.raise_for_status()
        payload = response.json()
        children = payload.get("data", {}).get("children", [])
        if not children:
            break
        for child in children:
            data = child.get("data")
            if data:
                items.append(data)
                remaining -= 1
                if remaining <= 0:
                    break
        after = payload.get("data", {}).get("after")
        if not after:
            break
    return items


def download_file(url: str, destination: pathlib.Path) -> bool:
    try:
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        with destination.open("wb") as fh:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    fh.write(chunk)
        return True
    except requests.RequestException as exc:
        tqdm.write(f"Failed to download {url}: {exc}")
        return False


def handle_gallery(submission: dict, target_dir: pathlib.Path, allow_nsfw: bool) -> int:
    if submission.get("over_18") and not allow_nsfw:
        return 0
    if not submission.get("is_gallery"):
        return 0
    media_metadata = submission.get("media_metadata") or {}
    gallery_data = submission.get("gallery_data") or {}
    saved = 0
    for item in gallery_data.get("items", []):
        media_id = item.get("media_id")
        metadata = media_metadata.get(media_id, {})
        source = metadata.get("s") or {}
        url = source.get("u") or source.get("gif") or source.get("mp4")
        if not url:
            continue
        ext = pathlib.Path(url.split("?")[0]).suffix or ".jpg"
        filename = f"{sanitize_filename(str(submission.get('id', 'post')))}_{saved}{ext}"
        if download_file(url, target_dir / filename):
            saved += 1
    return saved


def handle_media(submission: dict, target_dir: pathlib.Path, allow_nsfw: bool) -> int:
    if submission.get("over_18") and not allow_nsfw:
        return 0

    if submission.get("is_self"):
        return 0

    if submission.get("is_gallery"):
        return handle_gallery(submission, target_dir, allow_nsfw)

    url = submission.get("url_overridden_by_dest") or submission.get("url")
    if not url:
        return 0

    parsed_ext = pathlib.Path(url.split("?")[0]).suffix.lower()

    if submission.get("is_video"):
        media = submission.get("secure_media") or submission.get("media") or {}
        reddit_video = media.get("reddit_video") if isinstance(media, dict) else {}
        if reddit_video:
            video_url = reddit_video.get("fallback_url")
            if video_url:
                ext = pathlib.Path(video_url.split("?")[0]).suffix or ".mp4"
                filename = f"{sanitize_filename(str(submission.get('id', 'post')))}{ext}"
                if download_file(video_url, target_dir / filename):
                    tqdm.write(
                        f"Saved {filename} (Reddit video - may lack audio, see README for details)"
                    )
                    return 1
        return 0

    if parsed_ext in IMAGE_EXTENSIONS or parsed_ext == ".mp4":
        filename = f"{sanitize_filename(str(submission.get('id', 'post')))}{parsed_ext}"
        if download_file(url, target_dir / filename):
            return 1

    return 0


def scrape(
    subreddit: str,
    sort: str,
    limit: int,
    destination: pathlib.Path,
    allow_nsfw: bool,
    user_agent: str,
    progress_callback: Optional[Callable[[int, int, int], None]] = None,
    show_progress_bar: bool = True,
) -> tuple[int, pathlib.Path]:
    submissions = list(fetch_submissions(subreddit, sort, limit, user_agent=user_agent))
    target_dir = ensure_directory(destination, subreddit)
    saved = 0
    total_posts = len(submissions)
    processed = 0

    if progress_callback:
        progress_callback(processed, total_posts, saved)

    if show_progress_bar:
        with tqdm(total=total_posts or limit, desc=f"{subreddit}/{sort}") as progress:
            for submission in submissions:
                saved += handle_media(submission, target_dir, allow_nsfw)
                processed += 1
                progress.update(1)
                if progress_callback:
                    progress_callback(processed, total_posts, saved)
        tqdm.write(f"Finished. Downloaded {saved} files into {target_dir}")
    else:
        for submission in submissions:
            saved += handle_media(submission, target_dir, allow_nsfw)
            processed += 1
            if progress_callback:
                progress_callback(processed, total_posts, saved)

    if progress_callback:
        progress_callback(processed, total_posts, saved)

    return saved, target_dir


def parse_args(argv: Optional[Iterable[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download images and Reddit-hosted videos from a subreddit."
    )
    parser.add_argument(
        "subreddit",
        nargs="?",
        help="Name of the subreddit to scrape (without r/ prefix)",
    )
    parser.add_argument(
        "--sort",
        choices=sorted(VALID_SORTS),
        default="hot",
        help="Sorting method for submissions (default: hot)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=25,
        help="Number of submissions to process (default: 25)",
    )
    parser.add_argument(
        "--output",
        type=pathlib.Path,
        default=pathlib.Path("downloads"),
        help="Directory to store downloaded media (default: ./downloads)",
    )
    parser.add_argument(
        "--allow-nsfw",
        action="store_true",
        help="Include NSFW posts (default: skip)",
    )
    parser.add_argument(
        "--user-agent",
        default=DEFAULT_USER_AGENT,
        help="Custom User-Agent header (default: %(default)s)",
    )
    parser.add_argument(
        "--gui",
        action="store_true",
        help="Launch the graphical interface",
    )
    return parser.parse_args(argv)


def main(argv: Optional[Iterable[str]] = None) -> None:
    args = parse_args(argv)
    if args.gui:
        run_gui()
        return

    if not args.subreddit:
        raise SystemExit("Subreddit is required in CLI mode. Launch with --gui for the GUI.")

    saved, target_dir = scrape(
        subreddit=args.subreddit,
        sort=args.sort,
        limit=args.limit,
        destination=args.output,
        allow_nsfw=args.allow_nsfw,
        user_agent=args.user_agent,
    )
    print(f"Finished. Downloaded {saved} files into {target_dir}")


def run_gui() -> None:
    import tkinter as tk
    from tkinter import filedialog, messagebox, ttk

    root = tk.Tk()
    root.title("Reddit Media Scraper")
    root.resizable(False, False)

    mainframe = ttk.Frame(root, padding="12 12 12 12")
    mainframe.grid(row=0, column=0, sticky="nsew")

    subreddit_var = tk.StringVar()
    limit_var = tk.StringVar(value="25")
    sort_var = tk.StringVar(value="hot")
    nsfw_var = tk.BooleanVar(value=False)
    output_var = tk.StringVar(value=str(pathlib.Path("downloads").resolve()))
    user_agent_var = tk.StringVar(value=DEFAULT_USER_AGENT)

    status_var = tk.StringVar(value="Idle")
    saved_var = tk.StringVar(value="")

    ttk.Label(mainframe, text="Subreddit:").grid(row=0, column=0, sticky="w")
    subreddit_entry = ttk.Entry(mainframe, textvariable=subreddit_var, width=30)
    subreddit_entry.grid(row=0, column=1, columnspan=2, sticky="we")

    ttk.Label(mainframe, text="Limit:").grid(row=1, column=0, sticky="w")
    limit_entry = ttk.Entry(mainframe, textvariable=limit_var, width=8)
    limit_entry.grid(row=1, column=1, sticky="w")

    ttk.Label(mainframe, text="Sort:").grid(row=2, column=0, sticky="w")
    sort_combo = ttk.Combobox(
        mainframe,
        textvariable=sort_var,
        values=sorted(VALID_SORTS),
        state="readonly",
        width=10,
    )
    sort_combo.grid(row=2, column=1, sticky="w")

    ttk.Checkbutton(mainframe, text="Allow NSFW", variable=nsfw_var).grid(
        row=3, column=1, sticky="w"
    )

    ttk.Label(mainframe, text="Output Folder:").grid(row=4, column=0, sticky="w")
    output_entry = ttk.Entry(mainframe, textvariable=output_var, width=30)
    output_entry.grid(row=4, column=1, sticky="we")

    def choose_folder() -> None:
        path = filedialog.askdirectory(initialdir=output_var.get() or ".")
        if path:
            output_var.set(path)

    ttk.Button(mainframe, text="Browse…", command=choose_folder).grid(row=4, column=2, padx=4)

    ttk.Label(mainframe, text="User-Agent:").grid(row=5, column=0, sticky="w")
    user_agent_entry = ttk.Entry(mainframe, textvariable=user_agent_var, width=30)
    user_agent_entry.grid(row=5, column=1, columnspan=2, sticky="we")

    progress_bar = ttk.Progressbar(
        mainframe,
        orient="horizontal",
        length=280,
        mode="determinate",
        maximum=1.0,
    )
    progress_bar.grid(row=6, column=0, columnspan=3, pady=(10, 0), sticky="we")

    status_label = ttk.Label(mainframe, textvariable=status_var, anchor="w")
    status_label.grid(row=7, column=0, columnspan=3, sticky="we")

    saved_label = ttk.Label(mainframe, textvariable=saved_var, anchor="w")
    saved_label.grid(row=8, column=0, columnspan=3, sticky="we")

    start_button = ttk.Button(mainframe, text="Start Download")
    start_button.grid(row=9, column=0, columnspan=3, pady=(10, 0))

    progress_queue: queue.Queue[tuple[str, tuple[int, int, int] | str]] = queue.Queue()

    def update_progress(current: int, total: int, saved: int) -> None:
        progress_queue.put(("progress", (current, total or 1, saved)))

    def worker(
        subreddit: str,
        limit: int,
        sort: str,
        allow_nsfw: bool,
        output_dir: pathlib.Path,
        user_agent: str,
    ) -> None:
        try:
            saved_count, target_dir = scrape(
                subreddit=subreddit,
                sort=sort,
                limit=limit,
                destination=output_dir,
                allow_nsfw=allow_nsfw,
                user_agent=user_agent,
                progress_callback=update_progress,
                show_progress_bar=False,
            )
            progress_queue.put(("done", f"Downloaded {saved_count} files to {target_dir}"))
        except Exception as exc:  # noqa: BLE001
            progress_queue.put(("error", str(exc)))

    def poll_queue() -> None:
        try:
            while True:
                kind, payload = progress_queue.get_nowait()
                if kind == "progress" and isinstance(payload, tuple):
                    current, total, saved = payload
                    progress_bar["maximum"] = max(total, 1)
                    progress_bar["value"] = min(current, progress_bar["maximum"])
                    status_var.set(f"Processing {current}/{total} posts…")
                    saved_var.set(f"Saved files: {saved}")
                elif kind == "done" and isinstance(payload, str):
                    status_var.set("Done")
                    saved_var.set(payload)
                    start_button.config(state=tk.NORMAL)
                    messagebox.showinfo("Reddit Scraper", payload)
                elif kind == "error" and isinstance(payload, str):
                    status_var.set("Error")
                    saved_var.set(payload)
                    start_button.config(state=tk.NORMAL)
                    messagebox.showerror("Reddit Scraper", payload)
        except queue.Empty:
            pass
        finally:
            root.after(150, poll_queue)

    def start_download() -> None:
        subreddit = subreddit_var.get().strip()
        if not subreddit:
            messagebox.showwarning("Validation", "Please enter a subreddit name.")
            subreddit_entry.focus()
            return

        try:
            limit = int(limit_var.get())
            if limit <= 0:
                raise ValueError
        except ValueError:
            messagebox.showwarning("Validation", "Limit must be a positive integer.")
            limit_entry.focus()
            return

        sort_value = sort_var.get()
        if sort_value not in VALID_SORTS:
            messagebox.showwarning("Validation", "Invalid sort selected.")
            sort_combo.focus()
            return

        output_dir = pathlib.Path(output_var.get()).expanduser().resolve()
        user_agent = user_agent_var.get().strip() or DEFAULT_USER_AGENT

        output_dir.mkdir(parents=True, exist_ok=True)

        status_var.set("Starting download…")
        saved_var.set("")
        progress_bar["value"] = 0
        progress_bar["maximum"] = limit
        start_button.config(state=tk.DISABLED)

        thread = threading.Thread(
            target=worker,
            args=(subreddit, limit, sort_value, nsfw_var.get(), output_dir, user_agent),
            daemon=True,
        )
        thread.start()

    start_button.config(command=start_download)
    poll_queue()
    subreddit_entry.focus()
    root.mainloop()


if __name__ == "__main__":
    main()

