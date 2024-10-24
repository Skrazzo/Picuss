const generatePinCode = () => Math.floor(100000 + Math.random() * 900000);
const getFieldset = () => cy.get("legend").contains("hidden image").parent();
const getChangeButton = () => getFieldset().find("button").contains("Change");
let pinCode = generatePinCode().toString();

describe("Visit hidden page, and create pin-code", () => {
    beforeEach(() => {
        cy.login();
        cy.visit("/hidden");
    });

    it("Visits the website", () => {
        cy.get("p.label")
            .should("be.visible") // Header should be visible
            .should("have.text", "Create pin-code");
    });

    it("Can create pin-code", () => {
        // Loop through pin code inputs and write the correct pin code one by one
        cy.get(`[aria-label="PinInput"]`)
            .should("be.visible")
            .each(($el, index) => {
                cy.wrap($el).type(pinCode[index]);
            });
        let submitBtn = cy.get("button").contains("Create pin-code");
        submitBtn.click();
        submitBtn.click();
        submitBtn.should("not.exist");
    });
});

describe("Visits settings and changes/resets the pin-code", () => {
    beforeEach(() => {
        cy.login();
        cy.visit("/settings");
    });

    it("Fails to change the pin-code", () => {
        // Find pin-code change section
        let generalBtn = cy.get("span").contains("General");
        generalBtn.should("be.visible");
        generalBtn.click();

        // Fieldset form
        getFieldset().should("be.visible");

        // Change nothing
        let changeBtn = getChangeButton();
        changeBtn.click();

        // Check if error is visible
        getFieldset().get("label").contains("is required").should("be.visible");

        getFieldset()
            .find("input")
            .should("be.visible")
            .each(($el, index) => {
                cy.wrap($el).type(pinCode);
            });

        changeBtn.click();

        // Check if error is visible
        getFieldset().get("label").contains("must be different").should("be.visible");
    });

    it("Changes the pin-code", () => {
        // Find pin-code change section
        let generalBtn = cy.get("span").contains("General");
        generalBtn.should("be.visible");
        generalBtn.click();

        getFieldset().should("be.visible");

        // Get new random pin-code
        let newPinCode = generatePinCode().toString();
        while (newPinCode === pinCode) {
            newPinCode = generatePinCode().toString();
        }

        getFieldset()
            .find("input")
            .should("be.visible")
            .each((el, index) => {
                if (index > 0) {
                    // New pin-code
                    cy.wrap(el).type(newPinCode);
                } else {
                    cy.wrap(el).type(pinCode);
                }
            });

        getChangeButton().click();

        // all three inputs now need to be empty
        getFieldset()
            .find("input")
            .each((el) => {
                cy.wrap(el).should("have.value", "");
            });
    });

    it("Resets the pin-code", () => {
        // Visits the page, and finds general section
        let generalBtn = cy.get("span").contains("General");
        generalBtn.should("be.visible");
        generalBtn.click();

        // Reset pin-code
        cy.get("button").contains("Forgot your pin").click();
        cy.get(`input[placeholder="Your password"]`).type("cypress123");
        let confirmBtn = cy.get("button").contains("Confirm");
        confirmBtn.click();
        confirmBtn.click();

        // Check if pin-code has been reset, by finding text that it needs to be created
        cy.contains("You can change your hidden picture pin-code when you create it.").should("be.visible");
    });
});
