/// <reference path="gametools.d.ts"/>

import React from 'react';

import ReactDOM from 'react-dom';

import * as ReactDOMServer from 'react-dom/server';

import GameTools from './GameTools';

import Emitter from 'component-emitter';

import '../jquery-sortel.js';

import sortBy from 'lodash-es/sortBy';

type GameArrayFunctionItem = () => GameArrayItem;
export type GameArrayItem = DisplayedItem|GameArrayFunctionItem;
export interface GameArray extends Array<GameArrayItem> {
    contentsIndex?: number;
    indexPollers?: Array<() => void>;
    initialized?: boolean;
}
export interface GameValue<T> {
    gametools_val: {};
}
export function initializeArray(array: GameArray, clearPollers = false, shouldWarn = false) {
    array.contentsIndex = 0;
    
    if(!array.initialized || clearPollers)
        array.indexPollers = new Array();
    array.initialized = true;
    array.forEach((item) => {
        if(isDisplayedItem(item)) {
            if(shouldWarn || item.getParentArray(false) == null)
                item.setParentArray(array);
        }
    });
}
export async function resetSystem(array: GameArray) {
    for(let index = 0; index < array.length; index++) {
        const item = array[index];
        if(isDisplayedItem(item))
            await item.reset();
    }
}
export async function restart(array: GameArray, shouldInitialize = false) {
    
    if(array.contentsIndex != undefined) {
        const item = array[array.contentsIndex];
        if(isDisplayedItem(item) && item.isDisplaying()) {
            await item.undisplay();
        }
    }
    if(!array.initialized || shouldInitialize)
        initializeArray(array);

    let item = await toDisplayedItem(array[array.contentsIndex], array);
    await item.display();
}
export function wakeUpPollers(array: GameArray) {
    let currentPollers = array.indexPollers.slice();
    currentPollers.forEach((poller) => {
        array.indexPollers = array.indexPollers.splice(array.indexPollers.indexOf(poller), 1);
        poller();
    });
}
export function isDisplayedItem(item: GameArrayItem): item is DisplayedItem {
    return ((item as any)._isDisplaying !== undefined);
}
export async function toDisplayedItem(item: GameArrayItem, array?: GameArray): Promise<DisplayedItem> {
    if(isDisplayedItem(item)) {
        if(!item.resetOnce())
            await item.reset();
        return (item as DisplayedItem);
    }
    const arrayItem: GameArrayFunctionItem = (item as GameArrayFunctionItem);
    let realItem = arrayItem();
    if(isDisplayedItem(realItem)) {
        if(array !== undefined) {
            realItem.setParentArray(array);
            (realItem as any).wrapper = item;
        }
        await realItem.reset();
        return realItem;
    } else {
        let nextItem = await toDisplayedItem(realItem, array);
        return nextItem;
    }
    
}
export async function startDisplay(array: GameArray) {
    await initializeArray(array);
    await restart(array);
}
export abstract class DisplayedItem {
    public parentArray: GameArray;
    private arraySet: boolean;
    private _isDisplaying = false;
    public instantiationTrace: string;
    protected autoWakePollers: boolean;
    private wrapper: GameArrayFunctionItem;
    private hasReset: boolean;
    private static showers: number = 0;
    private reactedSet: Set<HTMLElement>;
    public static visibleStack: DisplayedItem[] = [];
    private layerNum: number;
    public static readonly NUM_ZINDEXES = 100;
    public setLayer(layer: number): this {
        if(this.layerNum != layer) {
            this.layerNum = layer;
            if(this._isDisplaying) {
                this.removeFromVisibleStack();
                this.addToVisibleStack();
            }
        }
        return this;
    }
    public getLayer(): number {
        return this.layerNum;
    }
    public async doRenderReact<T extends React.Component>(element: JSX.Element, container: HTMLElement, callback?: (component: T) => any): Promise<void> {
        ReactDOM.render(element, container, function() {
            if(callback != undefined && callback != null)
                callback(this);
        });
        this.reactedSet.add(container);
    }
    public scope(array: GameValue<GameArray>): this {
        this.parentArray = DisplayedItem.getValue(this, array);
        return this;
    }
    public static getValue<T>(item: DisplayedItem, val: GameValue<T>, container?: HTMLElement): T {
        let value: T;
        if(val == null || val == undefined) {
            value = null;
        } else if(Object(val) !== val) {
            value = ((val as unknown) as T);
        } else if(val instanceof Function) {
            value = val();
        } else if(React.isValidElement(val)) {
            if(container !== undefined && item != null && item != undefined) {
                item.doRenderReact(val as JSX.Element, container);
                return undefined;
            } else {
                value = ((ReactDOMServer.renderToStaticMarkup(val as JSX.Element) as unknown) as T);
                console.warn("In most cases, rendering React components to a string will not give the desired behavior, " +
                             "as event handlers and other related metadata will not be included.");
            }
            
        } else {
            value = (val.valueOf() as T);
        }
        if(container !== undefined) {
            container.innerHTML = ((value as unknown) as string);
            return undefined;
        }
        return value;
    }
    public getAppendedContainer(showingNew: boolean, adjustNumber = true): JQuery<HTMLElement> {
        const $normal = $("#gametools-container");

        return $normal;
    }
    static async handleResize() {
        for(let i = 0; i < DisplayedItem.visibleStack.length; i++) {
            await DisplayedItem.visibleStack[i].resize();
        }
    }
    protected updateZIndex()
    {
        function zindex(z: any): number {
            if(z == 'auto')
                return 0;
            else if(z == undefined || z == null)
                return 0;
            else {
                try {
                    return parseInt(z);
                } catch(e) {
                    return 0;
                }
            }
        }
        /* Sort all the elements in gametools-container by z-index */
        const gc: HTMLElement = $("#gametools-container").get(0);
        let nodes = Array.from(gc.childNodes);
        nodes = sortBy(nodes, (node) => zindex($(node).css('z-index')));
        while (gc.firstChild) {
            gc.removeChild(gc.firstChild);
        }
        nodes.forEach((node) => gc.appendChild(node));
    }
    public getZIndex(): number {
        let index: number;
        if(this._isDisplaying)
            index = DisplayedItem.visibleStack.indexOf(this);
        else
            throw new Error("Cannot get z-index of undisplayed item");
        const z =  index * DisplayedItem.NUM_ZINDEXES;
        return z;
    }
    public isDisplaying(): boolean {
        return this._isDisplaying;
    }
    static getCurrentlyVisible(): DisplayedItem {
        if(DisplayedItem.visibleStack.length > 0)
            return DisplayedItem.visibleStack[DisplayedItem.visibleStack.length - 1];
        else
            return null;
    } 
    static updateHelp(helpItem?: React.Component) {
        if(helpItem == undefined || helpItem == null)
            helpItem = GameTools.helpRef.current;
        if(DisplayedItem.visibleStack.length == 0) {
            if(GameTools.helpShown)
                helpItem.setState({ visible: false });
            return;
        }
        const visible = (DisplayedItem.getCurrentlyVisible().getHelp() !== "");
        if(GameTools.helpShown)
            helpItem.setState({ visible: visible });
    }
    private contextualHelp(): string {
        let item = this as unknown as ContextualHelpItem;
        if(item.gt_help !== undefined)
            return item.gt_help;
        else
            return "";
    }
    public readonly getHelp: () => string = () => {
        return this.objectHelp() + this.contextualHelp();
    };
    protected objectHelp(): string {
        return "";
    }
    constructor(protected objStyle?: StylisticOptions) {
        this._isDisplaying = false;
        this.wrapper = null;
        this.parentArray = null;
        this.arraySet = false;
        this.autoWakePollers = true;
        this.hasReset = false;
        this.reactedSet = new Set<HTMLElement>();
        this.layerNum = 0;
        Emitter(this);
        this.initStyles();
        this.setupExtendedEvents();
    }
    protected getDefaultStyle(): StylisticOptions {
        return {};
    }
    private initStyles(): StylisticOptions {
        if(this.objStyle === undefined)
            this.objStyle = this.getDefaultStyle();
        else {
            let df = this.getDefaultStyle();
            Object.assign(df, this.objStyle);
            this.objStyle = df;
        }
        if(this.objStyle.shouldColorBackgrounds === undefined)
            this.objStyle.shouldColorBackgrounds = true;
        if(this.objStyle.shouldShuffle === undefined)
            this.objStyle.shouldShuffle = true;
        if(this.objStyle.showBackdrop === undefined)
            this.objStyle.showBackdrop = true;
        if(this.objStyle.forceShowClose === undefined)
            this.objStyle.forceShowClose = false;
        if(this.objStyle.customBackgroundClassList === undefined)
            this.objStyle.customBackgroundClassList = ""; 
        if(this.objStyle.customBodyClassList === undefined)
            this.objStyle.customBodyClassList = "";
        if(this.objStyle.useAsContainer === undefined)
            this.objStyle.useAsContainer = false;
        if(this.objStyle.showCorrectConfirmation === undefined)
            this.objStyle.showCorrectConfirmation = true;
        if(this.objStyle.stripPunctuation == undefined)
            this.objStyle.stripPunctuation = true;
        if(this.objStyle.defaultValue == undefined)
            this.objStyle.defaultValue = "";
        if(this.objStyle.showMobileTips == undefined)
            this.objStyle.showMobileTips = true;
        if(this.objStyle.spellCheck == undefined)
            this.objStyle.spellCheck = true;
        return this.objStyle;
    }
    
    public readonly on: (event: string, fn: (...args: any[]) => void) => this;
    public readonly once: (event: string, fn: (...args: any[]) => void) => this;
    public readonly off: (event?: string, fn?: (...args: any[]) => void) => this;
    public readonly emit: (event: string, ...args: any[]) => this;
    public readonly listeners: (event: string) => ((...args: any[]) => void)[];
    public readonly hasListeners: (event: string) => boolean;
    public setParentArray(array: GameArray, force = false): this {
        if(array == null) {
            array = [ this ];
            initializeArray(array);
        }
        if(force || !this.arraySet) {
            this.parentArray = array;
            this.arraySet = true;
        } else {
            console.warn("Parent array is already set:");
            console.warn(this.parentArray);
            console.warn("Not being changed.");
        }
        return this;
    }
    public getParentArray(createDynamic = true): GameArray {
        if(createDynamic && this.parentArray == null) {
            this.setParentArray([ this ]);
            initializeArray(this.parentArray);
        }
        return this.parentArray;
        
    }
    async resize() {

    }
    public myIndex: () => number = function() {
        let array =  this.getParentArray();
        if(this.wrapper != null)
            return array.indexOf(this.wrapper);
        else
            return array.indexOf(this);
    };
    private removeFromVisibleStack() {
        let index = DisplayedItem.visibleStack.indexOf(this);
        DisplayedItem.visibleStack.splice(index, 1);
        for(; index < DisplayedItem.visibleStack.length; index++) {
            DisplayedItem.visibleStack[index].updateZIndex();
        }
    }
    private addToVisibleStack() {
        let i = 0;
        for(; i < DisplayedItem.visibleStack.length; i++) {
            if(DisplayedItem.visibleStack[i].layerNum >= this.layerNum)
                break;
        }
        DisplayedItem.visibleStack.splice(i, 0, this);
        for(; i < DisplayedItem.visibleStack.length; i++) {
            DisplayedItem.visibleStack[i].updateZIndex();
        }
    }
    private static readonly gt_windowEventHandlers = ['keydown', 'keyup'];
    private gtDomEventHandler(event: JQuery.Event) {
        this.emit(`dom-${event.type}`, event);
    }
    private setupExtendedEvents() {
        let pressedKeys: any[] = [];
        this.on("dom-keydown", (event: JQuery.KeyDownEvent) => {
            let isFirst = false;
            if(pressedKeys.indexOf(event.which) == -1) {
                pressedKeys.push(event.which);
                isFirst = true;
            }
            this.emit("gt-keydown", event, isFirst);
        });
        this.on("dom-keyup", (event: JQuery.KeyUpEvent) => {
            const index = pressedKeys.indexOf(event.which);
            if(index != -1) {
                pressedKeys.splice(index, 1);
            }
            this.emit("gt-keyup", event);
        });
    }
    private attachEventHandlers() {
        DisplayedItem.gt_windowEventHandlers.forEach((eventName) => {
            $(window).on(eventName, $.proxy(this.gtDomEventHandler, this));
        });
    }
    private detachEventHandlers() {
        DisplayedItem.gt_windowEventHandlers.forEach((eventName) => {
            $(window).off(eventName, $.proxy(this.gtDomEventHandler, this));
        });
    }
    async display() {
        this._isDisplaying = true;
        this.addToVisibleStack();
        DisplayedItem.updateHelp();
        DisplayedItem.updateContainerClasses();
        this.attachEventHandlers();
        this.emit("display");
    }
    static updateContainerClasses() {
        if(DisplayedItem.visibleStack.length > 0)
            $("#gametools-container").addClass("gt-ditem-visible");
        else
            $("#gametools-container").removeClass("gt-ditem-visible");
    }
    private async detachReact() {
        for(const element of this.reactedSet) {
            ReactDOM.unmountComponentAtNode(element);
            this.reactedSet.delete(element);
        }
    }
    public readonly undisplay = async () => {
        this._isDisplaying = false;
        DisplayedItem.updateHelp();
        DisplayedItem.updateContainerClasses();
        this.detachEventHandlers();
        await this.detachReact();
        await this._undisplay();
    };
    async _undisplay() {
        if(this.reactedSet.size > 0) {
            console.error("There should not be any mounted React components on an undisplayed DisplayedItem.");
            this.reactedSet.forEach((react_el) => {
                console.log(react_el);
            });
        }
        this.emit("undisplay");
    }
    static doLog(obj: any, logFunc: (obj: any) => any, trace: string) {
        logFunc(obj);
        if(trace !== null && trace !== undefined)
            logFunc(trace);
    }
    logError(obj: any): void {
        DisplayedItem.doLog(obj, console.error, this.instantiationTrace);
    }
    logWarning(obj: any): void {
        DisplayedItem.doLog(obj, console.warn, this.instantiationTrace);
    }
    public isSelfContained(): boolean {
        let array = this.getParentArray();
        return (array.length == 1 && array[0] == this);
    }
    getNextItem(): GameArrayItem {
        if(this.myIndex() == -1)
            return null;
        if(this.getParentArray().contentsIndex == this.getParentArray().length - 1) {
            this.logWarning("No next items at index " + this.getParentArray().contentsIndex + " (self-contained: " + this.isSelfContained() + ")");
            return null;
        }
        this.getParentArray().contentsIndex += 1;
        return this.getParentArray()[this.getParentArray().contentsIndex];
    }
    async redisplay() {
        setTimeout(async () => {
            await this.undisplay();
            if(this._isDisplaying)
                throw new Error("This item did not call super.undisplay()!");
            let err = new Error("The item following this one did not call super.display()!");
            setTimeout(async () => {
                await this.display();
                if(!this._isDisplaying)
                    throw err;
            }, 0);
        }, 0);
    }
    protected async moveToNext() {
        let item = this.getNextItem();
        if(item != null) {
            let err = new Error("The item following this one did not call super.display()!");
            setTimeout(async () => {
                let realItem = await toDisplayedItem(item, this.getParentArray());
                await realItem.display();
                if(realItem.autoWakePollers)
                    wakeUpPollers(realItem.getParentArray());
                if(!realItem._isDisplaying)
                    throw err;
            }, 0);
        }
    }
    public setContextHelp(help: GameValue<string>): ContextualHelpItem&this {
        let hi = (this as unknown as ContextualHelpItem);
        hi.gt_help = DisplayedItem.getValue(this, help);
        return hi as ContextualHelpItem&this;
    }
    public static async waitForIndex(array: GameArray, index: number) {
        while(true) {
            if(array.contentsIndex == index)
                return;
            await new Promise((resolve) => {
                array.indexPollers.push(resolve);
            });
        }
    }
    public async displayNext() {
        setTimeout(async () => {
            await this.undisplay();
            if(this._isDisplaying)
                throw new Error("This item did not call super.undisplay()!");
            await this.moveToNext();
        }, 0);
    }
    async reset() {
        this.hasReset = true;
    }
    public resetOnce(): boolean {
        return this.hasReset;
    }
}

export interface StylisticOptions {
    shouldColorBackgrounds?: boolean;
    shouldShuffle?: boolean;
    showBackdrop?: boolean;
    forceShowClose?: boolean;
    customBackgroundClassList?: string|string[];
    customBodyClassList?: string|string[];
    useAsContainer?: boolean;
    showCorrectConfirmation?: boolean;
    stripPunctuation?: boolean;
    defaultValue?: any;
    showMobileTips?: boolean;
    spellCheck?: boolean;
}

export interface LabelledItem extends DisplayedItem {
    gt_label: string;
}
export interface ContextualHelpItem extends DisplayedItem {
    gt_help: string;
}

$(window).off("resize", DisplayedItem.handleResize);
$(window).on("resize", DisplayedItem.handleResize);

export default DisplayedItem;