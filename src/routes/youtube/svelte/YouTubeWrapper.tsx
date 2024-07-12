import { reactify } from "svelte-preprocess-react";
import { Youtube } from "svelte-youtube-lite";

const YoutubeWrapper = reactify(Youtube);
export default YoutubeWrapper;
