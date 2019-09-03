import InfoBox from './InfoBox';

import '@fortawesome/fontawesome-free/css/all.css';

export class TitleScreen extends InfoBox {
    constructor() {
        super(null, "Test", "Start", 0);
    }
    async dialogCreated() {
        await super.dialogCreated();
        this.$content.html(`<h1 class="display-4">Welcome to ${document.title}!</h1>`);
        this.$content.append($("<h3 class='d-inline-block'></h3>").append($("<small></small>").addClass("text-muted").html("Need help during the game? Use this button when it appears:")));
        this.$content.append("<button disabled='disabled' class='control-button btn btn-info bs-enabled'><i class='fas fa-question'></i></button>");
        this.$footer.addClass("gt-ts-footer");
    }
}
export default TitleScreen;