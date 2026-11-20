import BaseView from "./common/BaseView.js";

import Patient from "../models/Patient.js";

import InvalidInputError from "../errors/InvalidInputError.js";

import Toast from "./common/Toast.js";



/**





 *  "Patient Registrations" page:

while admin is using the system :

 *   1. a form to register a walk-in patient

 *   2. a searchable table of every registered patient with a Delete button

 *   3. ama adoos save tebaat el data lel patient controller 



 * ENCAPSULATION: every element and helper below is private (#).



 */

export default class RegistrationsView extends BaseView {

  #toast;

  #root = null;

  #form;

  #inputs = {};

  #formMessage;

  #heading;

  #tbody;

  #searchInput;



  /** The Router creates it: new RegistrationsView(ctx, params). */
  constructor(ctx, params) {
    super(ctx, params);
    // Belal's Toast, once it has show(); until then messages appear under the form.
    this.#toast = typeof Toast.show === "function" ? Toast : null;
  }

  /** The patients controller from app.js (Lojaine's PatientController). */
  get #patients() {
    return this.c.patients;
  }



  



  /** BaseView: the Router puts this HTML in the page, then calls bind(root). */
  render() {
    return '<div class="reg-host"></div>';
  }

  /** BaseView: replace the placeholder with the page built from DOM elements. */
  bind(root) {
    root.querySelector(".reg-host")?.replaceWith(this.element());
  }

  /** Builds the page once, refreshes the table, returns the root element. */
  element() {

    if (!this.#root) {

      this.#root = this.#buildPage();

    }

    this.refresh();

    return this.#root;

  }



  /** Convenience: puts the page inside a container element. */

  mount(container) {

    container.replaceChildren(this.element());

  }



  /** Redraws the table from the latest data (keeps the search text). */

  refresh() {

    this.#renderTable();

  }



  // ======================= Building the page =======================



  #buildPage() {

    const root = RegistrationsView.#el("section", { className: "registrations-view" });



    const header = RegistrationsView.#el("header", { className: "reg-page-header" });

    header.append(

      RegistrationsView.#el("h1", { text: "Patient Registrations" }),

      RegistrationsView.#el("p", { text: "Everyone registered at the hospital" })

    );



    root.append(

      header,

      this.#buildCard("Register a walk-in patient", this.#buildForm()),

      this.#buildTableCard()

    );

    return root;

  }



  /** INTEGRATION POINT (Card): the only place panels are created. */

  #buildCard(title, body, headerExtra = null) {

    const card = RegistrationsView.#el("div", { className: "reg-card" });

    const head = RegistrationsView.#el("div", { className: "reg-card-head" });

    const heading = RegistrationsView.#el("h2", { text: title });

    head.append(heading);

    if (headerExtra) head.append(headerExtra);

    card.append(head, body);

    card.headingElement = heading;

    return card;

  }



  #buildForm() {

    const form = RegistrationsView.#el("form", {

      className: "reg-form",

      attrs: { novalidate: "", autocomplete: "off" },

    });



    const name = RegistrationsView.#field("name", "Full name", "input", {

      type: "text",

    });

    const phone = RegistrationsView.#field("phone", "Phone", "input", {

      type: "tel",

      inputmode: "numeric",

      placeholder: "01XXXXXXXXX",

    });

    const age = RegistrationsView.#field("age", "Age", "input", {

      type: "text",

      inputmode: "numeric",

    });



    const gender = RegistrationsView.#field("gender", "Gender", "select", {});

    Patient.GENDERS.forEach((g) => {

      gender.control.append(RegistrationsView.#el("option", { text: g, attrs: { value: g } }));

    });

    gender.control.value = "Female"; // default shown in the PDF screenshot



    this.#inputs = {

      name: name.control,

      phone: phone.control,

      age: age.control,

      gender: gender.control,

    };



    // Typing in a field removes its red outline and the old message.

    Object.values(this.#inputs).forEach((input) => {

      input.addEventListener("input", () => this.#clearErrors());

      input.addEventListener("change", () => this.#clearErrors());

    });



    const saveButton = RegistrationsView.#el("button", {

      className: "reg-btn-primary",

      text: "Save patient",

      attrs: { type: "submit" },

    });



    this.#formMessage = RegistrationsView.#el("p", {

      className: "reg-form-message",

      attrs: { role: "status", "aria-live": "polite" },

    });



    form.append(name.wrapper, phone.wrapper, age.wrapper, gender.wrapper, saveButton);

    form.addEventListener("submit", (event) => {

      event.preventDefault();

      this.#handleSave();

    });

    this.#form = form;



    const wrapper = RegistrationsView.#el("div");

    wrapper.append(form, this.#formMessage);

    return wrapper;

  }



  #buildTableCard() {

    // Search box (top right of the card)

    const searchLabel = RegistrationsView.#el("label", {

      className: "reg-search",

      attrs: { for: "reg-search-input" },

    });

    this.#searchInput = RegistrationsView.#el("input", {

      attrs: { id: "reg-search-input", type: "search", placeholder: "Name or phone" },

    });

    this.#searchInput.addEventListener("input", () => this.#renderTable());

    searchLabel.append(RegistrationsView.#el("span", { text: "Search" }), this.#searchInput);



    // Table

    const table = RegistrationsView.#el("table", { className: "reg-table" });

    const headRow = RegistrationsView.#el("tr");

    ["ID", "Name", "Phone", "Age", "Gender", "Visits", "Registered"].forEach((title) => {

      headRow.append(RegistrationsView.#el("th", { text: title, attrs: { scope: "col" } }));

    });

    table.append(RegistrationsView.#el("thead"), (this.#tbody = RegistrationsView.#el("tbody")));

    table.tHead.append(headRow);



    const scroller = RegistrationsView.#el("div", { className: "reg-table-scroll" });

    scroller.append(table);



    const card = this.#buildCard("Registered patients", scroller, searchLabel);

    this.#heading = card.headingElement;

    return card;

  }



  // ======================= Table =======================



  #renderTable() {

    if (!this.#tbody) return;



    const everyone = this.#patients.all();

    const query = this.#searchInput.value;

    const shown = everyone.filter((patient) => patient.matches(query));



    this.#heading.textContent = `Registered patients (${everyone.length})`;

    this.#tbody.replaceChildren();



    if (shown.length === 0) {

      const text =

        everyone.length === 0

          ? "No patients registered yet. Use the form above to register the first one."

          : `No patients match “${query.trim()}”. Try a different name or phone number.`;

      const cell = RegistrationsView.#el("td", {

        className: "reg-empty",

        text,

        attrs: { colspan: "7" },

      });

      const emptyRow = RegistrationsView.#el("tr");

      emptyRow.append(cell);

      this.#tbody.append(emptyRow);

      return;

    }



    shown.forEach((patient) => this.#tbody.append(this.#buildRow(patient)));

  }



  #buildRow(patient) {

    const row = RegistrationsView.#el("tr");

    const cell = (text, className = "") =>

      RegistrationsView.#el("td", { text: String(text), className });



    // The registered cell also holds the Delete button (as in the PDF).

    const deleteButton = RegistrationsView.#el("button", {

      className: "reg-btn-delete",

      text: "Delete",

      attrs: { type: "button", "aria-label": `Delete ${patient.name}` },

    });

    deleteButton.addEventListener("click", () => this.#handleDelete(patient));



    const registered = RegistrationsView.#el("td", { className: "reg-registered" });

    registered.append(

      RegistrationsView.#el("span", { text: patient.getRegisteredLabel() }),

      deleteButton

    );



    row.append(

      cell(patient.id, "reg-id"),

      cell(patient.name, "reg-name"), // textContent: typed names can never inject HTML

      cell(patient.phone),

      cell(patient.age),

      cell(patient.gender),

      cell(this.#patients.visitCount(patient.id)),

      registered

    );

    return row;

  }



  // ======================= Actions =======================



  #handleSave() {

    this.#clearErrors();

    try {

      const patient = this.#patients.register({

        name: this.#inputs.name.value,

        phone: this.#inputs.phone.value,

        age: this.#inputs.age.value,

        gender: this.#inputs.gender.value,

      });



      this.#form.reset();

      this.#inputs.gender.value = "Female";

      this.#searchInput.value = ""; // so the new row is visible

      this.#renderTable();

      this.#inputs.name.focus();

      this.#notify(`${patient.name} was registered with ID ${patient.id}.`, "success");

    } catch (error) {

      if (error instanceof InvalidInputError) {

        this.#showFormError(error);

      } else {

        console.error(error);

        this.#showFormError(new InvalidInputError("Something went wrong. Please try again."));

      }

    }

  }



  #handleDelete(patient) {

    try {

      this.#patients.delete(patient.id);

      this.#renderTable();

      this.#notify(`${patient.name} was deleted.`, "success");

    } catch (error) {

      if (error instanceof InvalidInputError) {

        this.#notify(error.message, "error"); // red toast when deletion is blocked

      } else {

        console.error(error);

        this.#notify("Something went wrong. Please try again.", "error");

      }

    }

  }



  // ======================= Messages =======================



  /** Shows a validation error under the form and outlines the faulty field. */

  #showFormError(error) {

    this.#formMessage.textContent = error.message;

    this.#formMessage.className = "reg-form-message is-error";

    const input = this.#inputs[error.field];

    if (input) {

      input.classList.add("is-invalid");

      input.setAttribute("aria-invalid", "true");

      input.focus();

    }

  }



  #clearErrors() {

    this.#formMessage.textContent = "";

    this.#formMessage.className = "reg-form-message";

    Object.values(this.#inputs).forEach((input) => {

      input.classList.remove("is-invalid");

      input.removeAttribute("aria-invalid");

    });

  }



  /**

   * INTEGRATION POINT (Toast): the only place Toast is called.

   * type = "success" (green) or "error" (red).

   * If no Toast was given, the message is shown under the form instead.

   */

  #notify(message, type) {

    if (this.#toast && typeof this.#toast.show === "function") {

      this.#toast.show(message, type);

      return;

    }

    this.#formMessage.textContent = message;

    this.#formMessage.className = `reg-form-message ${type === "error" ? "is-error" : "is-success"}`;

  }



  // ======================= Small DOM helpers =======================



  /** Creates an element: #el("p", { className, text, attrs }). */

  static #el(tag, { className = "", text = "", attrs = {} } = {}) {

    const element = document.createElement(tag);

    if (className) element.className = className;

    if (text) element.textContent = text;

    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));

    return element;

  }



  /** A label + input/select pair. Returns { wrapper, control }. */

  static #field(name, labelText, controlTag, attrs) {

    const id = `reg-${name}`;

    const wrapper = RegistrationsView.#el("div", { className: "reg-field" });

    const label = RegistrationsView.#el("label", { text: labelText, attrs: { for: id } });

    const control = RegistrationsView.#el(controlTag, { attrs: { id, name, ...attrs } });

    wrapper.append(label, control);

    return { wrapper, control };

  }

}


