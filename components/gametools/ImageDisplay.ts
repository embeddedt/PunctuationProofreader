import InfoBox from './InfoBox';
export class ImageDisplay extends InfoBox {
    constructor(protected src: string) {
        super("", "<img src='" + src + "'/>");
    }
    async dialogCreated() {
        super.dialogCreated();
        let $img = this.$content.find("img");
        $img.addClass("gt-image-display mfp-popup-wrapper");
        ($img as any).magnificPopup({
            items: {
                src: this.src
            },
            type: 'image'
        });
    }
}
export default ImageDisplay;