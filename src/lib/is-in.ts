import { flip, includes } from "ramda";

const isIn = flip(includes);

export default isIn;
