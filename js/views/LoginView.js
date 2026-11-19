  /* =========================================
   HAM HOSPITAL - LOGIN VIEW
   Owner: Nourhan Alaa Eldin
========================================= */

export default class LoginView {

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

                                <a href="#" class="auth-tab is-active">
                                    Sign in
                                </a>

                                <a href="#" class="auth-tab"
                                   data-signup>
                                    Create account
                                </a>

                            </div>


                            <!-- HEADING -->
                            <div class="auth-form-heading">

                                <h2>Welcome back</h2>

                                <p>
                                    Sign in to manage your appointments.
                                </p>

                            </div>


                            <!-- LOGIN FORM -->
                            <form class="auth-form" id="loginForm">

                                <div class="auth-field">

                                    <label for="loginPhone">
                                        Phone number
                                    </label>

                                    <input
                                        type="tel"
                                        id="loginPhone"
                                        placeholder="Enter your phone number"
                                        required
                                    >

                                </div>


                                <div class="auth-field">

                                    <label for="loginPassword">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        id="loginPassword"
                                        placeholder="Enter your password"
                                        required
                                    >

                                </div>


                                <div class="auth-error" id="loginError">
                                    Wrong phone number or password.
                                </div>


                                <div class="auth-success" id="loginSuccess">
                                    Login successful!
                                </div>


                                <button
                                    type="submit"
                                    class="auth-submit"
                                    id="loginButton">

                                    Sign in →

                                </button>

                            </form>


                            <p class="auth-switch-copy">

                                New here?

                                <a href="#" data-signup>
                                    Create an account
                                </a>

                            </p>


                            <p class="auth-switch-copy">
                                Demo patient: 01012345678 · Password: 1234
                            </p>

                        </div>

                    </section>

                </div>

            </div>
        `;
    }


    bind() {

        const form = document.getElementById("loginForm");

        const error = document.getElementById("loginError");

        const success = document.getElementById("loginSuccess");

        const button = document.getElementById("loginButton");


        // GO TO SIGN UP
        document.querySelectorAll("[data-signup]").forEach(link => {

            link.addEventListener("click", (e) => {

                e.preventDefault();

                Router.go("signup");

            });

        });


        // LOGIN SUBMIT
        form.addEventListener("submit", async (e) => {

            e.preventDefault();

            error.classList.remove("is-visible");
            success.classList.remove("is-visible");

            const phone = document.getElementById("loginPhone").value.trim();

            const password = document.getElementById("loginPassword").value;

            button.disabled = true;

            button.textContent = "Signing in...";


            try {

                const result = await AuthController.signIn(phone, password);

                success.textContent = "Login successful!";

                success.classList.add("is-visible");


                setTimeout(() => {

                    if (result.role === "ADMIN") {

                        Router.go("dashboard");

                    } else {

                        Router.go("appointments");

                    }

                }, 700);


            } catch (err) {

                error.textContent =
                    "Wrong phone number or password.";

                error.classList.add("is-visible");

                button.disabled = false;

                button.textContent = "Sign in →";

            }

        });

    }

}
