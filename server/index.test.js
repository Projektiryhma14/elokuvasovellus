import { expect } from "chai";

// TESTI LUO UUDEN KÄYTTÄJÄN "testuser" JOTA KÄYTETÄÄN KAIKKIIN TESTEIHIN (PL. ARVOSTELUT) JA POISTAA KÄYTTÄJÄN TESTIEN JÄLKEEN
// JOTEN TIETOKANTAAN EI JÄÄ TESTIEN JÄLJILTÄ ROSKAA

describe("Testing basic database functionality", () => {
    let idToDelete // Muuttuja johon tallennetaan rekisteröitymisen yhteydessä user_id

    // Testataan rekisteröityminen vaadittavilla tiedoilla
    it("should successfully sign up with the required information", async () => {
        const newSignUp = { username: "testuser", email: "test@test.fi", password: "Qwerty1234!" }
        const response = await fetch("http://localhost:3001/signup", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newSignUp)
        })
        const data = await response.json()
        expect(response.status).to.equal(201)
        expect(data).to.include.all.keys(["email", "id"])
        idToDelete = data.id
        expect(data.description).to.equal(newSignUp.description)
    })

    // Testataan rekisteröityminen ilman vaadittuja salasanan vaatimuksia
    it("should not sign up without minimum password requirements", async () => {
        const newSignUp = { username: "testuser2", email: "test@test.fi", password: "qwerty1234!" }
        const response = await fetch("http://localhost:3001/signup", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newSignUp)
        })
        const data = await response.json()
        expect(response.status).to.equal(400)
        expect(data).to.have.property("error")
        expect(data.error).to.match(/Password must be at least 8 chars and include an uppercase letter, a digit, and special character/i)
    })

    // Testataan kirjautumista ensimmäisessä testissä luodulla tunnuksella
    it("should successfully log in with valid credentials", async () => {
        const newLogin = { username: "testuser", password: "Qwerty1234!" }
        const response = await fetch("http://localhost:3001/signin", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newLogin)
        })
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data).to.include.all.keys(["username", "email", "id", "token"])
        expect(data.description).to.equal(newLogin.description)
    })

    // Testataan kirjautumista tunnuksella jota ei ole olemassa
    it("should not log in with invalid username", async () => {
        const newLogin = { username: "testuser1234", password: "Qwerty1234!" }
        const response = await fetch("http://localhost:3001/signin", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newLogin)
        })
        const data = await response.json()
        expect(response.status).to.equal(404)
        expect(data).to.have.property("error")
        expect(data.error).to.match(/not found/i)
    })

    // Testataan kirjautumista väärällä salasanalla
    it("should not log in with invalid password", async () => {
        const newLogin = { username: "testuser", password: "Qwerty1235!" }
        const response = await fetch("http://localhost:3001/signin", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newLogin)
        })
        const data = await response.json()
        expect(response.status).to.equal(401)
        expect(data).to.have.property("error")
        expect(data.error).to.match(/invalid password/i)
    })

    // Testataan käyttäjän poistamista
    it("should successfully delete user", async () => {
        const newDelete = { userId: idToDelete }
        const response = await fetch(`http://localhost:3001/deleteuser/${idToDelete}`, {
            method: "delete",
            headers: { "Content-Type": "application/json" }
        })
        const data = await response.json()
        expect(data).to.have.property("message");
        expect(data.message).to.equal("User deleted");
    })

    // Testataan arvostelujen hakemista (Tulee virhe jos yhtään arvostelua ei ole)
    it("should get all reviews", async () => {
        const response = await fetch("http://localhost:3001/reviews")
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data).to.be.an("array").that.is.not.empty
        expect(data[0]).to.include.all.keys(["review_id", "movie_name", "movie_id", "movie_rating", "movie_review", "created_at"])
    })

})



