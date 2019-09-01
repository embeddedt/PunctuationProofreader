/// <reference types="jqueryui"/>

import InfoBox from './InfoBox';
import GameTools from './GameTools';
import { GameValue, DisplayedItem } from './DisplayedItem';

import '../jqueryui/jquery-ui.min.js';
import '../jqueryui/jquery-ui.min.css';
import '../jqueryui/jquery.ui.touch-punch.min.js';
import '@fortawesome/fontawesome-free/css/all.css';

export interface DragTargetsQuestionItem {
    target?: GameValue<string>;
    name: GameValue<string>;
}

export function cancelTooltipTimeout($target: JQuery): void {
    var timeout = $target.data("tooltip-timeout");
    if(timeout) {
        clearTimeout(timeout);
        $target.removeData("tooltip-timeout");
    }
}

export class DragTargetsQuestion extends InfoBox {
    static alwaysBeRight = false;
    constructor(protected title: GameValue<string>, protected items: DragTargetsQuestionItem[], protected shuffleTargets = false, protected shuffleOptions = false, protected allowMultiple = false, delay = InfoBox.defaultDelay) {
        super(title, "", "Check", delay);
    }
    buttonCallback(e: JQuery.ClickEvent): void {
        var $itemsDiv = this.$dialog.find(".modal-body .items-div");
        var $targetsDiv =  this.$dialog.find(".modal-body .targets-div");

        var $targets = $targetsDiv.find(".target");
        GameTools.lastResult = true;
        if(!DragTargetsQuestion.alwaysBeRight) {
            $targets.each((index, element): false | void => {
                const myName = $(element).find("span").text();
                let containedItems = new Set<string>();
                this.items.forEach((item) => {
                    if(item.target !== undefined && item.target == myName) {
                        containedItems.add(DisplayedItem.getValue(this, item.name));
                    }
                });
                $(element).children().each((index, child): false | void => {
                    if(!$(child).hasClass("drag-item")) {
                        return; /* Skip question mark and span */
                    }
                    let childText = $($(child).children().get(0)).text();
                    if(!containedItems.has(childText)) {
                        GameTools.lastResult = false;
                        return false;
                    } else {
                        containedItems.delete(childText);
                    }
                });
                if(GameTools.lastResult == false)
                    return false;
                if(containedItems.size > 0) {
                    GameTools.lastResult = false;
                    return false;
                }
            });
        }

        super.buttonCallback(e);
    }
    async dialogCreated() {
        var $targetsDiv = $("<div></div>");
        var $itemsDiv = $("<div></div>");
        var $bothDivs =  $targetsDiv.add($itemsDiv);
        var $containerDiv = $("<div></div>").append($bothDivs);
        $containerDiv.css({
            "display": "flex",
            "width": "100%",
            "height": "100%"
        });
        this.$dialog.find(".modal-body").append($containerDiv);
        
        $bothDivs.addClass("dragtargets-div");
        $targetsDiv.addClass("targets-div");
        $itemsDiv.addClass("items-div");
        const targetNames = new Map<string, HTMLElement>();
        this.items.forEach(item => {
            const target = item.target;
            let $targetDiv = null;
            if(target != null && target != undefined) {
                if(!targetNames.has(DisplayedItem.getValue(this, target))) {
                    let $span = $("<span></span>");
                    DisplayedItem.getValue(this, target, $span.get(0));
                    let $div = $("<div></div>").append($span).addClass("target");
                    $div.data("my-text", target);
                    $targetsDiv.append($div);
                    $div.append($("<i></i>").addClass("fas fa-question-circle").click(function() {
                        var $target = $(this).parent();
                        cancelTooltipTimeout($target);
                        $target.tooltip('show');
                        $target.data("tooltip-timeout", setTimeout(() => {
                            $target.tooltip('hide');
                        }, 3000));
                    }));
                    $div.children("i").hide();
                    targetNames.set(DisplayedItem.getValue(this, target), $div.get(0));
    
                    $targetDiv = $div;
                    
                    
                    $targetDiv.attr("title", $targetDiv.data("my-text"));
                    $targetDiv.tooltip({
                        html: true
                    });
                    $targetDiv.tooltip('disable');
                } else {
                    $targetDiv = $(targetNames.get(DisplayedItem.getValue(this, target)));
                }
            }
            const backColor = GameTools.HSLToHex(GameTools.getRandomInt(0, 360), 100, 90);
            let $div = $("<div></div>").addClass("drag-item").data("target", $targetDiv).css({
                "background-color": backColor,
                "color": GameTools.getContrastYIQ(backColor)
            });
            let $tmpDiv = $("<div></div>").css("margin", "auto");
            DisplayedItem.getValue(this, item.name, $tmpDiv.get(0));
            $div.append($tmpDiv);
            $itemsDiv.append($div);
        });
        if(this.shuffleTargets)
            ($targetsDiv as any).randomize();
        if(this.shuffleOptions)
            ($itemsDiv as any).randomize();
         
        let gtBeforeDropFunction = function (event, ui) {
            console.log("gt before drop");
            if($(this).hasClass("target")) {
                $(this).tooltip('enable');
                $(this).children("i").show();
                $(this).children("span").hide();
            }
        };
        let displayedItem = this;
        let outFunction = function (event, ui) {
            console.log("out");
            if($(this).hasClass("target") && $(this).children(".drag-item").hasClass("ui-draggable-dragging")) {
                console.log($(this).children().get(0));
                $(this).children("i").hide();
                $(this).children("span").show();
                $(this).tooltip('disable');
            }
        };
        let dropFunction = function( event, ui ) {
            $(this).trigger("gt.before_drop");
            let $draggable = $(document).find(".ui-draggable-dragging");
            if(!$draggable.get(0)) {
                $draggable = $(this).children(".drag-item");
                if(!$draggable.get(0)) {
                    throw "Can't find draggable";
                }
            }
            console.log($draggable[0]);
            $draggable.css({
                "top": "",
                "left": ""
            });
            var $newParent = $(this);
            let isTeleporting = false;
            if(!displayedItem.allowMultiple && ($(this).hasClass("target") && $(this).find(".drag-item").length != 0) && !$draggable.equals($(this).find(".drag-item"))) {
                $newParent = $itemsDiv;
                isTeleporting = true;
                
            }
            $draggable.detach().appendTo($newParent);
            if($newParent.is($itemsDiv))
                $draggable.css({ "position": "relative"});
        };
        let dragInfo: JQueryUI.DraggableOptions = {
            containment: $("body"),
            start: function (event, ui) {
                $(ui.helper).css({ "transform": "none"});
                $(this).data("startingScrollTop",$(this).parent().scrollTop());
                
            },
            revert: function (droppable) {
                if(!droppable) {
                    console.log("Reverting!");
                    $(this).parent().trigger("gt.before_drop");
                    return true;
                } else
                    return false;
            },
            drag: function (event, ui) {
                if($(ui.helper).parent().hasClass("target")) {
                    $(ui.helper).parent().tooltip("hide");
                    cancelTooltipTimeout($(ui.helper).parent());
                }
            },
            stop: function (event, ui) {
                $(ui.helper).css({ "transform": ""});
            },
            scroll: true
        };
        console.log("should scroll");
        $targetsDiv.children("div").droppable().on("drop", dropFunction).on("dropout", outFunction).on("gt.before_drop", gtBeforeDropFunction);
        $itemsDiv.droppable().on("drop", dropFunction).on("dropout", outFunction);
        $itemsDiv.children("div").draggable(dragInfo);
    }
}