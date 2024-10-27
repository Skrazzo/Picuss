describe("Should visit manage tags page, create tags, edit them, and delete them", () => {
    beforeEach(() => {
        cy.login();
        cy.visit("/tags");
    });

    it("Visits the website", () => {
        cy.get("h3")
            .should("be.visible") // Header should be visible
            .invoke("text") // Get text of the title header
            .should("match", /Manage your \d{1,} tags/); //
    });

    let createInput = 'input[placeholder="Search tag name"]';
    let randomString = Math.random().toString(36).substring(2, 12);
    randomString = randomString.charAt(0).toUpperCase() + randomString.slice(1);

    it("Can create tags", () => {
        cy.get(createInput).type(randomString).type("{enter}");
        cy.contains(randomString).should("be.visible");
    });

    it("Can edit tags", () => {
        cy.contains(randomString).click();
        cy.get(`input[value='${randomString}']`).type("-edit");
        cy.contains("Success").should("be.visible");
    });

    it("Can create multiple tags", () => {
        for (let i = 0; i < 2; i++) {
            let rnd = Math.random().toString(36).substring(2, 12);
            rnd = rnd.charAt(0).toUpperCase() + rnd.slice(1);

            cy.get(createInput).type(rnd).type("{enter}");
            cy.contains(rnd).should("be.visible");
        }
    });

    it("Cannot create duplicate tags", () => {
        cy.get(createInput).type(`${randomString}-edit`).type("{enter}");
        cy.get(createInput).should("have.value", `${randomString}-edit`);
    });

    it("Can delete tags", () => {
        cy.get(`input[test="select-all-checkbox"]`).check();
        cy.get(`[test="delete-tags-icon"]`).click();
        cy.contains("Delete tags").click();
        cy.contains("Are you sure?").click();
        cy.contains("Success").should("be.visible");
    });
});
