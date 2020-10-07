cc.Class({
    extends: cc.Component,

    properties: {
        buddy: cc.Node,
        lButton: cc.Node,
        rButton: cc.Node,
        background: cc.Node,
        curtain: cc.Node,
        logo: cc.Node,
        downloadButton: cc.Node,
        disappearTime: 10,
        resultTime: 1.5,
        fadeInTime: 0.5,
        buttonPadding: 0.05, // per cent
        resultLogoMove: 300,
        targetCurtainOpacity: 150,
        prevDiag: { // screen diagonal used for scaling
            default: 0,
            visible: false,
        }
    },

    onDownload: function () {
        if (cc.sys.os == cc.sys.OS_IOS)
            cc.sys.openURL("https://apps.apple.com/us/app/kick-the-buddy-forever/id1435346021");
        else
            cc.sys.openURL("https://play.google.com/store/apps/details?id=com.playgendary.kickthebuddy&hl=en");
    },

    onActionButton: function (e, animation) {
        let skeleton = this.buddy.getComponent(sp.Skeleton);
        skeleton.setMix(skeleton.animation, animation, 0.5);
        skeleton.addAnimation(0, animation, true);

        this.lButton.getComponent(cc.Button).interactable = false;
        this.rButton.getComponent(cc.Button).interactable = false;

        this.curtain.getComponent(cc.BlockInputEvents).enabled = true;

        setTimeout(this.onResult.bind(this), this.resultTime*1000);
    },

    onResult: function () {
        this.lButton.stopAction();
        this.lButton.runAction(cc.hide());
        this.rButton.stopAction();
        this.rButton.runAction(cc.hide());

        let action_down = cc.moveBy(this.fadeInTime, cc.v2(0, -this.resultLogoMove))
            .easing(cc.easeCubicActionOut());
        let action_up = cc.moveBy(this.fadeInTime, cc.v2(0, this.resultLogoMove))
            .easing(cc.easeCubicActionOut());
        let action_fade = cc.fadeTo(this.fadeInTime, this.targetCurtainOpacity)
            .easing(cc.easeCubicActionOut());
        this.logo.runAction(action_down);
        this.downloadButton.runAction(action_up);
        this.curtain.runAction(action_fade);
    },

    onLoad: function () {
        this.prevDiag = cc.v2(960, 640); // diagonal of default resolution to scale from
        this.onResize();
        cc.view.setResizeCallback(this.onResize.bind(this));

        let action_disappear1 = cc.repeatForever(cc.sequence(
            cc.fadeOut(this.disappearTime), cc.fadeIn(0)));
        let action_disappear2 = cc.repeatForever(cc.sequence(
            cc.fadeOut(this.disappearTime), cc.fadeIn(0)));
        this.lButton.runAction(action_disappear1);
        this.rButton.runAction(action_disappear2);

        let lWidget = this.lButton.getComponent(cc.Widget); 
        let rWidget = this.rButton.getComponent(cc.Widget);
        lWidget.isAbsoluteBottom = false; // init widget units as percentage
        lWidget.isAbsoluteLeft = false;
        lWidget.isAbsoluteRight = false;
        rWidget.isAbsoluteRight = false;
        rWidget.isAbsoluteBotom = false;
    },

    alignButtons: function () {
        let viewW = cc.view.getVisibleSize().width;
        let viewH = cc.view.getVisibleSize().height;
        let lWidget = this.lButton.getComponent(cc.Widget);
        let rWidget = this.rButton.getComponent(cc.Widget);
        if (viewW > viewH) { // horizontal layout
            lWidget.isAlignLeft = false;
            lWidget.isAlignRight = true;
            lWidget.right = this.buttonPadding;
            lWidget.bottom = this.rButton.height
                * this.rButton.scale / viewH
                + this.buttonPadding*2;
        }
        else { // vertical layout
            lWidget.isAlignRight = false;
            lWidget.isAlignLeft = true;
            lWidget.left = this.buttonPadding;
            lWidget.bottom = this.buttonPadding;
        }
        lWidget.updateAlignment();
        rWidget.updateAlignment();
    },

    onResize: function () {
        let viewH = this.background.height = cc.view.getVisibleSize().height;
        let viewW = this.background.width = cc.view.getVisibleSize().width;

        let new_diag = cc.v2(viewW, viewH);
        let scaler = new_diag.mag() / this.prevDiag.mag();
        if (viewW > viewH) { // scale buddy by height if horizontal orientation
            this.buddy.scale = 0.5 * viewH / this.buddy.height;
        }
        else { // scale buddy by width if vertical orientation
            this.buddy.scale = 0.4 * viewW / this.buddy.width;
        }
        // scale other elements by diagonal
        this.lButton.scale *= scaler;
        this.rButton.scale *= scaler;
        this.logo.scale *= scaler;
        this.downloadButton.scale *= scaler;
        
        this.alignButtons();
        this.prevDiag = new_diag;
    }
});