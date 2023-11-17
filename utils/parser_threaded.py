import os
import threading
import time
from pathlib import Path
from assist_parser import AssistParser

MAX_THREADS = 16
activeThreads = 0

class AssistParserThreaded(AssistParser):
    def __init__(self, pdf_path, debug=False):
        self.lock = threading.Lock()
        super().__init__(pdf_path, debug)


def process_pdf(pdf_path, debug=False):
    global activeThreads
    try:
        AssistParserThreaded(pdf_path, debug)
    except Exception as e:
        print(f"Error while processing {pdf_path}, skipping. Exception: {e}")
    activeThreads -= 1
    if activeThreads < 0:
        print("idk how this happened")
        activeThreads = 0

def main():
    threads = []
    global activeThreads
    for path in Path(r'').rglob('*.pdf'):
        if os.path.isfile(path.with_suffix('.json')):
            continue

        while activeThreads >= MAX_THREADS:
            time.sleep(0.2)
        thread = threading.Thread(target=process_pdf, args=(path, False))
        threads.append(thread)
        thread.start()
        activeThreads += 1

    for thread in threads:
        thread.join()


if __name__ == '__main__':
    main()
    print("Done!")
