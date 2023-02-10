export const encode = (value: string) => {
  return btoa(encodeURIComponent(value));
};

export const decode = (base64Value: string) => {
  return decodeURIComponent(atob(base64Value));
};
