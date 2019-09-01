import GameTools from "./GameTools";
import InfoBox from './InfoBox';
import domtoimage from 'dom-to-image-more';
import 'intersection-observer';
export class HoleFinder extends InfoBox {
    modal_content: JQuery<HTMLElement>;
    images: JQuery<HTMLElement>;
    imageIndex: number;
    isAnimating: boolean;
    observer: IntersectionObserver;
    currentRatio: number;
    currentImage: HTMLImageElement;
    shouldContinue: boolean;
    allowClicks: boolean;
    holeFinder: JQuery<HTMLElement>;
    startTime: number;
    constructor(protected randomImages: string[], protected customClasses = "", protected hasCorrect = true, protected somethingElseString = "Try something else") {
        super(null, null, null);
    }
    newIndex() {
       this.imageIndex = GameTools.getRandomInt(0, this.randomImages.length - 1);
    }
    async reset() {
        await super.reset();
        this.newIndex();
        this.isAnimating = false;
        this.allowClicks = true;
        this.currentRatio = 0;
        this.currentImage = null;
        this.shouldContinue = false;
    }
    stopAnimation() {
    }
    async _undisplay() {
        this.shouldContinue = false;
        this.stopAnimation();
        await super._undisplay();
    }
    objectHelp(): string {
        return super.objectHelp() + "You are looking for a certain object. When you see it, click to take a picture of it!<p></p>If you choose the wrong object or your picture isn't clear enough, you'll be prompted to take another one.<hr/>";
    }
    async animateNextImage() {
        await GameTools.sleep(2000);
        let $image = $("<div></div>").css("background-image", `url(${this.randomImages[this.imageIndex]})`).attr("data-index", this.imageIndex);
        $image.css("z-index", GameTools.getRandomInt(1, 15));
        this.images.append($image);
        let dimension = this.holeFinder.outerWidth();
        let invert = GameTools.getRandomInt(0, 1) == 1 ? 1 : -1;
        $image.css("scaleX", invert.toString());
        $image.show();
        this.isAnimating = true;
        this.currentImage = $image.get(0) as HTMLImageElement;
        this.observer.observe(this.currentImage);
        const completeCallback = () => {
            this.isAnimating = false;
            if(this.currentImage != null)
                this.observer.unobserve(this.currentImage);
            this.currentImage = null;
            this.currentRatio = 0;
            $image.remove();
            if(this.shouldContinue)
                this.animateNextImage();
        };
        
        $image.addClass("hole-finder-animate");
        this.startTime = Date.now();
        console.log("start " + this.startTime);
        setTimeout(completeCallback, 1000);
        
        this.newIndex();
    }
    static removeImageBlanks(imageObject: HTMLImageElement) {
        let imgWidth = imageObject.width;
        let imgHeight = imageObject.height;
        var canvas = document.createElement('canvas');
        canvas.setAttribute("width", imgWidth.toString());
        canvas.setAttribute("height", imgHeight.toString());
        var context = canvas.getContext('2d');
        context.drawImage(imageObject, 0, 0);
    
        var imageData = context.getImageData(0, 0, imgWidth, imgHeight),
            data = imageData.data,
            getRBG = function(x, y) {
                var offset = imgWidth * y + x;
                return {
                    red:     data[offset * 4],
                    green:   data[offset * 4 + 1],
                    blue:    data[offset * 4 + 2],
                    opacity: data[offset * 4 + 3]
                };
            },
            isWhite = function (rgb) {
                // many images contain noise, as the white is not a pure #fff white
                return rgb.opacity == 0;
            },
                    scanY = function (fromTop) {
            var offset = fromTop ? 1 : -1;
    
            // loop through each row
            for(var y = fromTop ? 0 : imgHeight - 1; fromTop ? (y < imgHeight) : (y > -1); y += offset) {
    
                // loop through each column
                for(var x = 0; x < imgWidth; x++) {
                    var rgb = getRBG(x, y);
                    if (!isWhite(rgb)) {
                        if (fromTop) {
                            return y;
                        } else {
                            return Math.min(y + 1, imgHeight - 1);
                        }
                    }
                }
            }
            return null; // all image is white
        },
        scanX = function (fromLeft) {
            var offset = fromLeft? 1 : -1;
    
            // loop through each column
            for(var x = fromLeft ? 0 : imgWidth - 1; fromLeft ? (x < imgWidth) : (x > -1); x += offset) {
    
                // loop through each row
                for(var y = 0; y < imgHeight; y++) {
                    var rgb = getRBG(x, y);
                    if (!isWhite(rgb)) {
                        if (fromLeft) {
                            return x;
                        } else {
                            return Math.min(x + 1, imgWidth - 1);
                        }
                    }      
                }
            }
            return null; // all image is white
        };
    
        var cropTop = scanY(true),
            cropBottom = scanY(false),
            cropLeft = scanX(true),
            cropRight = scanX(false),
            cropWidth = cropRight - cropLeft,
            cropHeight = cropBottom - cropTop;
    
        canvas.setAttribute("width", cropWidth.toString());
        canvas.setAttribute("height", cropHeight.toString());
        // finally crop the guy
        canvas.getContext("2d").drawImage(imageObject,
            cropLeft, cropTop, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight);
    
        return canvas.toDataURL();
    }
    static async cropImageURL(url: string) {
        let img = document.createElement('img');
        img.src = url;
        return new Promise((resolve) => {
            img.onload = function() {
                resolve(HoleFinder.removeImageBlanks(img));
            };
        });
    }
    async dialogCreated() {
        await super.dialogCreated();
        this.allowClicks = true;
        this.modal_content = this.$content.parent();
        this.modal_content.empty();
        this.modal_content.css({
            "background-color": "transparent",
            "border": "none",
            "justify-content": "center",
            "align-items": "center",
            "box-shadow": "none"
        });
        let holeFinderContainer;
        this.modal_content.append(holeFinderContainer = $("<div></div>").addClass("hole-finder-container"));
        holeFinderContainer.append(this.holeFinder = $("<div></div>"));
        this.holeFinder.addClass("hole-finder " + this.customClasses);
        
        const bubbleContainer = $("<div></div>").addClass("bubble-container");
        this.holeFinder.append(bubbleContainer);
        for(var i = 0; i < 50; i++) {
            bubbleContainer.append($("<span class='bubble'></span>"));
        }
        
        this.images = $("<div></div>").addClass("hole-finder-images");
        this.holeFinder.append(this.images);
        let options = {
            root: this.images.get(0),
            rootMargin: '0px',
            threshold: 1.0
        };
        this.observer = new IntersectionObserver((entries) => {
            if(entries.length > 1)
                console.error("Not expecting multiple entries (" + entries.length + ")");
            this.currentRatio = entries[entries.length - 1].intersectionRatio;
        }, options);
        window.requestAnimationFrame(() => {
            this.shouldContinue = true;
            setTimeout(() => {
                this.animateNextImage();
            }, 0);
            
        });
        this.holeFinder.on('click', () => {
            if(!this.allowClicks)
                return;
            this.allowClicks = false;
            let foundItem = false;
            let errorMessage = "";
            const diff = (Date.now()-this.startTime);
            if(diff >= 350 && diff <= 850) {
                let index = parseInt(this.currentImage.getAttribute("data-index"));
                if(this.hasCorrect && index == 0) {
                    foundItem = true;
                } else
                    errorMessage = "That isn't what we're looking for. Try again.";
            } else
                errorMessage = "It doesn't look like this picture will be useful.<p></p>Remember that the whole object needs to be within the lens.<p></p>Try again.";
            if(foundItem) {
                this.displayNext();
                return;
            }

            

            const _self = this;
            let customInfoBox = class extends InfoBox {
                async dialogCreated() {
                    await super.dialogCreated();
                    if(!_self.hasCorrect)
                        this.$footer.append($("<button></button>").addClass("btn btn-secondary").html(_self.somethingElseString).addClass("gt-hole-something-else"));
                }
                buttonCallback(e: JQuery.ClickEvent) {
                    if($(e.target).hasClass("gt-hole-something-else")) {
                        this.once("undisplay", () => _self.displayNext());
                    }
                    super.buttonCallback(e);
                }
            };
            let infoBoxMade = async(infoBox: InfoBox) => {
                await infoBox.display();
            };
            domtoimage.toPng(this.holeFinder.get(0), {
                style: {
                    boxShadow: "none"
                }
            }).then(async(dataUrl) => {
                dataUrl = await HoleFinder.cropImageURL(dataUrl);
                let infoBox = new customInfoBox("Hmm...", "<img class='gt-preview-image' src='" + dataUrl + "'/><hr/>" + errorMessage, "OK", 0);
                await infoBoxMade(infoBox);
                this.allowClicks = true;
            }, async(reason) => {
                console.error(reason);
                let infoBox = new customInfoBox("Hmm...", errorMessage, "OK", 0);
                await infoBoxMade(infoBox);
                this.allowClicks = true;
            });
        });
    }
}
export default HoleFinder;