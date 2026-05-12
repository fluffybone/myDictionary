from collections import deque
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from threading import Lock


ACCOUNT_CREATE_COOLDOWN_SECONDS = 30
ACCOUNT_CREATE_MAX_REQUESTS_PER_WINDOW = 3
ACCOUNT_CREATE_WINDOW_SECONDS = 10 * 60


@dataclass
class RateLimitDecision:
    allowed: bool
    retry_after_seconds: int


_requests_by_ip: dict[str, deque[datetime]] = {}
_lock = Lock()


def _prune_expired_attempts(
    attempts: deque[datetime],
    now: datetime,
) -> deque[datetime]:
    window_start = now - timedelta(seconds=ACCOUNT_CREATE_WINDOW_SECONDS)
    while attempts and attempts[0] < window_start:
        attempts.popleft()
    return attempts


def check_account_creation_allowed(client_ip: str) -> RateLimitDecision:
    now = datetime.now(timezone.utc)

    with _lock:
        attempts = _requests_by_ip.setdefault(client_ip, deque())
        _prune_expired_attempts(attempts, now)

        if attempts:
            cooldown_until = attempts[-1] + timedelta(
                seconds=ACCOUNT_CREATE_COOLDOWN_SECONDS
            )
            if cooldown_until > now:
                retry_after = int((cooldown_until - now).total_seconds()) + 1
                return RateLimitDecision(
                    allowed=False,
                    retry_after_seconds=retry_after,
                )

        if len(attempts) >= ACCOUNT_CREATE_MAX_REQUESTS_PER_WINDOW:
            retry_after = int(
                (
                    attempts[0]
                    + timedelta(seconds=ACCOUNT_CREATE_WINDOW_SECONDS)
                    - now
                ).total_seconds()
            ) + 1
            return RateLimitDecision(
                allowed=False,
                retry_after_seconds=retry_after,
            )

        attempts.append(now)
        return RateLimitDecision(allowed=True, retry_after_seconds=0)


def reset_account_creation_rate_limit_state() -> None:
    with _lock:
        _requests_by_ip.clear()
