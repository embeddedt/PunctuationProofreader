import '../import-jquery';

import 'bootstrap';

import DisplayedItem, {GameValue, StylisticOptions, LabelledItem, wakeUpPollers } from './DisplayedItem';

import GameTools from './GameTools';

export class InfoBox extends DisplayedItem {
    public static readonly defaultDelay = 1000;
    public $dialog: JQuery<HTMLElement>;
    public $title: JQuery<HTMLElement>;
    public $content: JQuery<HTMLElement>;
    public $footer: JQuery<HTMLElement>;
    constructor(protected title: GameValue<string>, protected text: GameValue<string>, protected buttonText: GameValue<string> = "OK", protected delay?: number, style?: StylisticOptions) {
        super(style);
        this.$dialog = null;
        this.$content = null;
        this.$footer = null;
        this.$title = null;
        this.autoWakePollers = false;
    }
    protected async dialogCreated() {

    }
    public buttonCallback(e: JQuery.ClickEvent): void {
        console.log("InfoBox button callback");
        this.displayNext();
    }
    protected addCloseButton() {
        let close_button = $("<button></button>").addClass("close").attr({ "aria-label": "Close"});
        close_button.append($("<span></span>").attr("aria-hidden", "true").html("&times;"));
        close_button.click(this.buttonCallback.bind(this));
        this.$dialog.find(".modal-header").append(close_button);
    }
    async _undisplay() {
        await new Promise((resolve) => {
            this.$dialog.one("hidden.bs.modal", () => resolve());
            this.$dialog.modal('hide');
        });
        await super._undisplay();
    }
    protected dialogDisplayed() {

    }
    async reset() {
        await super.reset();
        if(this.delay == undefined) {
            if(this.myIndex() <= 0) {
                this.delay = 0;
            } else
                this.delay = InfoBox.defaultDelay;
        }
    }
    updateZIndex() {
        if(this.$dialog == null || this.$dialog == undefined)
            return;
        var zIndex = this.getZIndex() + 10;
        this.$dialog.css('z-index', zIndex);
        if(!this.objStyle.showBackdrop)
            return;
        const $backdrop: JQuery = this.$dialog.data("my-backdrop");
        if($backdrop != null && $backdrop != undefined)
            $backdrop.css('z-index', zIndex - 5);
        super.updateZIndex();
    }
    async display() {
        await super.display();
        await new Promise(async(resolve) => {
            await GameTools.sleep(this.delay);
            this.$dialog = $("<div></div>");
            this.getAppendedContainer(true).append(this.$dialog);
            this.$dialog.addClass("modal fade bd-example-modal-sm");
            this.$dialog.attr({
                "tabindex": -1,
                "role": "dialog",
                "data-keyboard": false,
                "data-backdrop": false,
                "aria-hidden": true
            });
            let modal_dialog = $("<div></div>").addClass("modal-dialog modal-dialog-centered modal-xl");
            this.$dialog.append(modal_dialog);
            if((this as DisplayedItem as LabelledItem).gt_label != undefined) {
                modal_dialog.attr("data-label", (this as DisplayedItem as LabelledItem).gt_label);
            }
            let modal_content = $("<div></div>").addClass("modal-content");
            modal_dialog.append(modal_content);
            modal_content.addClass(this.objStyle.customBackgroundClassList);
            let modal_header = $("<div></div>").addClass("modal-header");
            modal_content.append(modal_header);
            this.$title = $("<h5></h5>").addClass("modal-title");
            modal_header.append(this.$title);
            let close_button = $("<button></button>").addClass("close").attr({ "aria-label": "Close"});
            modal_header.append(close_button);
            close_button.append($("<span></span>").attr("aria-hidden", "true").html("&times;"));
            this.$content = $("<div></div>").addClass("modal-body").addClass(this.objStyle.customBodyClassList);
            modal_content.append(this.$content);
            this.$footer = $("<div></div>").addClass("modal-footer");
            modal_content.append(this.$footer);
            this.$footer.append($("<button></button>").addClass("btn btn-primary").attr("type", "button").text("OK"));

            if(this.title != null) {
                this.$dialog.find(".modal-header").show();
                DisplayedItem.getValue(this, this.title, this.$title.get(0));
            } else {
                this.$dialog.find(".modal-header").hide();
            }
                
            if(this.text != null) {
                this.$dialog.find(".modal-body").show();
                if(!this.objStyle.useAsContainer) {
                    DisplayedItem.getValue(this, this.text, this.$dialog.find(".modal-body").get(0));
                } else {
                    let header = modal_header.get(0);
                    let footer = this.$footer.get(0);
                    modal_content.empty();
                    DisplayedItem.getValue(this, this.text, modal_content.get(0));
                    let reactContainer = modal_content.children().get(0);
                    $(reactContainer).addClass("modal-body");
                    $(header).insertBefore(reactContainer);
                    $(footer).insertAfter(reactContainer);
                }
                
            } else {
                this.$dialog.find(".modal-body").hide();
            }
            this.$content.find(".gt-preview-image").each((index, el) => {
                $(el).addClass("mfp-popup-wrapper");
                ($(el) as any).magnificPopup({
                    items: {
                        src: $(el).attr("src")
                    },
                    type: 'image'
                });
            });
            this.$dialog.find(".modal-footer").empty();
            
            let realText = DisplayedItem.getValue(this, this.buttonText);
            let closeShown = false;
            if(realText != null && realText != "") {
                closeShown = true;
                this.$dialog.find(".close").show();
                this.$dialog.find(".modal-footer").show();
                this.$dialog.find(".modal-footer").append($("<button></button>").addClass("btn btn-primary").attr("type", "button").text(realText));
            } else {
                closeShown = false;
                this.$dialog.find(".close").hide();
                this.$dialog.find(".modal-footer").hide();
            }
            if(this.objStyle.forceShowClose) {
                let $close = this.$dialog.find(".close");
                $close.show();
                if(this.title == null) {
                    $close.appendTo(this.$content);
                    $close.addClass("modal-pinned-corner-close");
                }
                closeShown = true;
            }
            if(!closeShown)
                this.$dialog.find(".close").remove();
            await this.dialogCreated();
            let $closeButtons = this.$footer.find("button");
            let $close = this.$dialog.find(".close");
            $closeButtons = $closeButtons.add($close);

            $closeButtons.off("click");
            $closeButtons.on("click", (e) => this.buttonCallback(e));
            
            this.$dialog.one("show.bs.modal", (e) => {
                if(this.objStyle.showBackdrop) {
                    let $backdrop = $("<div></div>").addClass("modal-backdrop fade show");
                    this.getAppendedContainer(true, false).append($backdrop);
                    $(e.target).data("my-backdrop", $backdrop);
                } else
                    $(e.target).data("my-backdrop", null);
                this.updateZIndex();
            });
            this.$dialog.one("shown.bs.modal", () => {
                $(document.body).removeClass('modal-open');
                $("#gametools-container").addClass('modal-open');
                this.dialogDisplayed();
                resolve();
                wakeUpPollers(this.getParentArray());
            });
            const _self = this;
            this.$dialog.one("hide.bs.modal", function() {
                let $backdrop = $(this).data("my-backdrop");
                if($backdrop != null && $backdrop != undefined) {
                    $backdrop.removeClass("show");
                    setTimeout(() => {
                        $backdrop.remove();
                    }, 250);
                }
            });
            this.$dialog.one("hidden.bs.modal", (): void => {
                this.$dialog.modal('dispose');
                this.$dialog.remove();
                this.$dialog = null;
                this.$content = null;
                this.$footer = null;
                this.$title = null;
                $(document.body).removeClass('modal-open');
                $('.modal:visible').length && $("#gametools-container").addClass('modal-open');
                _self.getAppendedContainer(false, true);
            });
            this.$dialog.modal( { backdrop: false });
        });
    }
}

export default InfoBox;