const isGhPage = import.meta.env.MODE === "gh";

const prefix = isGhPage ? "/TokenMeter/viewer" : "/token_meter/viewer";

export const MAIN_URL = `${prefix}/main`;
export const CONFIG_URL = `${prefix}/config`;
export const IMAGE_URL = `${prefix}/image`;
export const TEST_URL = `${prefix}/test`;
