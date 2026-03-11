import signal
import threading
from contextlib import contextmanager

class TimeoutException(Exception): pass

@contextmanager
def time_limit(seconds):
  if threading.current_thread() is not threading.main_thread():
    # SIGALRM only works on the main thread; skip timeout
    yield
    return

  prev_handler = signal.getsignal(signal.SIGALRM)
  def signal_handler(signum, frame):
    raise TimeoutException("Timed out!")
  signal.signal(signal.SIGALRM, signal_handler)
  signal.alarm(seconds)
  try:
    yield
  finally:
    signal.alarm(0)
    signal.signal(signal.SIGALRM, prev_handler)
