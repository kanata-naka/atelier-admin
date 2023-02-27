import { css } from "@emotion/react";
import Image from "next/image";
import { loadingImageKeyframes } from "@/styles";

function SigningInEffect() {
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 9;
        background-color: white;
        transition: opacity 250ms;
      `}
    >
      <Image
        src="/images/loading.svg"
        width={64}
        height={64}
        alt="Loading..."
        css={css`
          display: block;
          animation: ${loadingImageKeyframes} 2s linear infinite;
          transform: translate(-50%, -50%);
        `}
      />
    </div>
  );
}

export default SigningInEffect;
