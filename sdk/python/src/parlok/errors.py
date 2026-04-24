class ParlokError(Exception):
    """Base class for parlok runtime errors."""


class ParlokDenied(ParlokError):
    def __init__(self, reason: str):
        super().__init__(reason)
        self.reason = reason


class RewriteFailed(ParlokError):
    pass


class PolicyError(ParlokError):
    pass
