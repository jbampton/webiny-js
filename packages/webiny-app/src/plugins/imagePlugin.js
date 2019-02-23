// @flow
import React from "react"; // eslint-disable-line
import { Image } from "webiny-ui/Image"; // eslint-disable-line
import type { ImageComponentPluginType } from "webiny-app/types";

const SUPPORTED_IMAGE_RESIZE_WIDTHS = [100, 300, 500, 750, 1000, 1500, 2500];

/**
 * Width of the image should not be just any random number. For optimization reasons,
 * we only allow the ones listed in SUPPORTED_IMAGE_RESIZE_WIDTHS list (Webiny Cloud supports only these).
 */
const sanitizeTransformArgs = (args: ?Object): Object => {
    const output = {};
    if (args) {
        let width = parseInt(args.width);
        if (width > 0) {
            output.width = SUPPORTED_IMAGE_RESIZE_WIDTHS[0];
            let i = SUPPORTED_IMAGE_RESIZE_WIDTHS.length;
            while (i >= 0) {
                if (width === SUPPORTED_IMAGE_RESIZE_WIDTHS[i]) {
                    output.width = SUPPORTED_IMAGE_RESIZE_WIDTHS[i];
                    break;
                }

                if (width > SUPPORTED_IMAGE_RESIZE_WIDTHS[i]) {
                    // Use next larger width. If there isn't any, use current.
                    output.width = SUPPORTED_IMAGE_RESIZE_WIDTHS[i + 1];
                    if (!output.width) {
                        output.width = SUPPORTED_IMAGE_RESIZE_WIDTHS[i];
                    }
                    break;
                }

                i--;
            }
        }
    }

    return output;
};

const convertTransformToQueryParams = (transform: Object): string => {
    return Object.keys(transform)
        .map(key => `${key}=${transform[key]}`)
        .join("&");
};

const imagePlugin: ImageComponentPluginType = {
    name: "image-component",
    type: "image-component",
    presets: {
        avatar: { width: 300 }
    },
    getImageSrc: props => {
        if (!props) {
            return "";
        }

        const { src, transform } = props;
        if (!transform) {
            return src;
        }

        if (!src || src.startsWith("data:")) {
            return src;
        }

        let params = sanitizeTransformArgs(transform);
        params = convertTransformToQueryParams(params);
        return src + "?" + params;
    },
    render(props) {
        let { transform, srcSet, ...imageProps } = props;

        const src = imageProps.src;
        if (srcSet && srcSet === "auto") {
            srcSet = {
                "2500w": imagePlugin.getImageSrc({ src, transform: { ...transform, width: 2500 } }),
                "1500w": imagePlugin.getImageSrc({ src, transform: { ...transform, width: 1500 } }),
                "750w": imagePlugin.getImageSrc({ src, transform: { ...transform, width: 750 } }),
                "500w": imagePlugin.getImageSrc({ src, transform: { ...transform, width: 500 } }),
                "300w": imagePlugin.getImageSrc({ src, transform: { ...transform, width: 300 } })
            };
        }

        return (
            <Image
                {...imageProps}
                srcSet={srcSet}
                src={imagePlugin.getImageSrc({ src, transform })}
            />
        );
    }
};

export default imagePlugin;
