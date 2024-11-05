import React from "react";
import "./inquire.css";

function InquirePage() {
    return(
    <div class="request-info">
        <section>
            <p>Contact us with some more information</p>
        </section>
    <section class= "form-container">
        <form class= "form">
            <div class ="form-group">
                <label for="number"> Phone Number</label>
                <input type="text" id="number" name="number" required=""></input>
            </div>
            <div class ="form-group">
                <label for="email"> Email</label>
                <input type="text" id="email" name="email" required=""></input>
            </div>
            <div class ="form-group">
                <label for="inquiry">Let us know more details</label>
                <textarea name="inquiry" id= "inquiry" rows = "20" cols= "50" required=""></textarea>
            </div>
            <button class = "submit-button" type="sumbit">Submit</button>
        </form>
    </section>
    </div>
    );
}
export default InquirePage;