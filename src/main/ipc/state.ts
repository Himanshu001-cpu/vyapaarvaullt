let isAuthenticated = false;

export function setAuthenticated(status: boolean) {
  isAuthenticated = status;
}

export function getAuthenticated() {
  return isAuthenticated;
}
