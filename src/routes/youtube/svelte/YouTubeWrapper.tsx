import { reactify } from "svelte-preprocess-react";
import { Youtube } from "svelte-youtube-lite";

const svelte = reactify({ Youtube });
const YoutubeWrapper = svelte.Youtube;
export default YoutubeWrapper;
