  /* =========================================
   HAM HOSPITAL - SIGN UP VIEW
   Owner: Nourhan Alaa Eldin
========================================= */

export default class SignUpView {

    render() {

        return `

            <div class="auth-page">

                <div class="auth-shell">


                    <!-- LEFT BRAND PANEL -->
                    <section class="auth-brand-panel">

                        <a href="#" class="auth-brand">

                            <svg viewBox="0 0 40 40" fill="none">

                                <path d="M7 5C7 18 14 28 23 32C23 19 17 9 7 5Z"
                                      fill="white"/>

                                <path d="M33 5C33 18 26 28 17 32C17 19 23 9 33 5Z"
                                      fill="#8ED9BA"/>

                            </svg>

                            <span>HAM Hospital</span>

                        </a>


                        <div class="auth-brand-copy">

                            <h1>
                                Your care,
                                <span>one click away</span>
                            </h1>

                            <p>
                                Book visits with our doctors, track your
                                appointments and read your medical reports
                                anytime.
                            </p>

                        </div>


                        <div class="auth-brand-footer">
                            Your Health, Our Priority
                        </div>

                    </section>



                    <!-- RIGHT FORM PANEL -->
                    <section class="auth-form-panel">

                        <div class="auth-form-container">


                            <a href="#" class="auth-back-link"
                               data-home>
                                ← Back to home
                            </a>


                            <!-- AUTH TABS -->
                            <div class="auth-tabs">

                                <a href="#" class="auth-tab"
                                   data-login>
                                    Sign in
                                </a>

                                <a href="#" class="auth-tab is-active">
                                    Create account
                                </a>

                            </div>



                            <!-- HEADING -->
                            <div class="auth-form-heading">

                                <h2>Create your account</h2>

                                <p>
                                    It takes less than a minute.
                                </p>

                            </div>



                            <!-- SIGN UP FORM -->
                            <form class="auth-form" id="signupForm">


                                <div class="auth-field">

                                    <label for="fullName">
                                        Full name
                                    </label>

                                    <input
                                        type="text"
                                        id="fullName"
                                        placeholder="Enter your full name"
                                        required
                                    >

                                </div>



                                <div class="auth-field">

                                    <label for="signupPhone">
                                        Phone number
                                    </label>

                                    <input
                                        type="tel"
                                        id="signupPhone"
                                        placeholder="Enter your phone number"
                                        required
                                    >

                                </div>



                                <!-- AGE + GENDER -->
                                <div class="auth-field-row">

                                    <div class="auth-field">

                                        <label for="age">
                                            Age
                                        </label>

                                        <input
                                            type="number"
                                            id="age"
                                            placeholder="Your age"
                                            min="1"
                                            max="120"
                                            required
                                        >

                                    </div>


                                    <div class="auth-field">

                                        <label for="gender">
                                            Gender
                                        </label>

                                        <select id="gender" required>

                                            <option value="Female">
                                                Female
                                            </option>

                                            <option value="Male">
                                                Male
                                            </option>

                                        </select>

                                    </div>

                                </div>



                                <div class="auth-field">

                                    <label for="signupPassword">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        id="signupPassword"
                                        placeholder="Create a password"
                                        required
                                    >

                                </div>



                                <div class="auth-field">

                                    <label for="confirmPassword">
                                        Confirm password
                                    </label>

                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        placeholder="Confirm your password"
                                        required
                                    >

                                </div>



                                <!-- ERROR -->
                                <div class="auth-error" id="signupError">
                                </div>


                                <!-- SUCCESS -->
                                <div class="auth-success" id="signupSuccess">
                                </div>



                                <button
                                    type="submit"
                                    class="auth-submit"
                                    id="signupButton">

                                    Create account →

                                </button>


                            </form>



                            <p class="auth-switch-copy">

                                Already have an account?

                                <a href="#" data-login>
                                    Sign in
                                </a>

                            </p>


                        </div>

                    </section>

                </div>

            </div>

        `;

    }



    bind() {

        const form = document.getElementById("signupForm");

        const error = document.getElementById("signupError");

        const success = document.getElementById("signupSuccess");

        const button = document.getElementById("signupButton");


        // GO TO LOGIN
        document.querySelectorAll("[data-login]").forEach(link => {

            link.addEventListener("click", (e) => {

                e.preventDefault();

                Router.go("login");

            });

        });



        // SIGN UP SUBMIT
        form.addEventListener("submit", async (e) => {

            e.preventDefault();

            error.classList.remove("is-visible");

            success.classList.remove("is-visible");


            const fullName =
                document.getElementById("fullName").value.trim();

            const phone =
                document.getElementById("signupPhone").value.trim();

            const age =
                Number(document.getElementById("age").value);

            const gender =
                document.getElementById("gender").value;

            const password =
                document.getElementById("signupPassword").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;



            // CHECK PASSWORD MATCH
            if (password !== confirmPassword) {

                error.textContent = "Passwords do not match.";

                error.classList.add("is-visible");

                return;

            }


            // CHECK PASSWORD LENGTH
            if (password.length < 4) {

                error.textContent = "Password must be at least 4 characters.";

                error.classList.add("is-visible");

                return;

            }


            button.disabled = true;

            button.textContent = "Creating account...";



            try {

                const data = {

                    fullName,

                    phone,

                    age,

                    gender,

                    password

                };


                await AuthController.signUp(data);


                success.textContent =
                    "Account created successfully!";

                success.classList.add("is-visible");


                setTimeout(() => {

                    Router.go("appointments");

                }, 1000);


            } catch (err) {

                error.textContent =
                    err.message || "Something went wrong. Please try again.";

                error.classList.add("is-visible");

                button.disabled = false;

                button.textContent = "Create account →";

            }

        });

    }

}
