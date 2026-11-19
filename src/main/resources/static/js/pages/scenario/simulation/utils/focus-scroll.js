// focus 시 자동 스크롤 되게하는 공통 함수
export function scrollToField(target) {
    if (!target?.isConnected || target.disabled) return;

    requestAnimationFrame(() => {
        if (!target.isConnected) return;

        target.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest"
        });
    });
}
