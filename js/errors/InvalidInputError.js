**
* InvalidInputError
* ------------------------------------------------------------------
* Thrown whenever user input breaks a validation rule
* (bad name, bad phone, duplicate phone, age out of range, ...)
* or when an action is not allowed (e.g. deleting a patient who still
* has scheduled appointments).
*
* It EXTENDS the built-in Error class (inheritance), so it can be
* thrown / caught like any normal error, but it carries one extra
* piece of information: `field`, the name of the form field that
* caused the problem ("name", "phone", "age", "gender").
* The view uses `field` to highlight the right input.
*
* Usage:
*   throw new InvalidInputError("Phone number must start with 01.", "phone");
*
*   try { ... } catch (err) {
*     if (err instanceof InvalidInputError) showMessage(err.message);
*   }
* yb2 hena ana aamla class beyaaml inheritance men el built in error class 
*/
xport class InvalidInputError extends Error {
 /** maanaha ene baaml inheritance men el built in class
  * @param {string} message - Clear, user-friendly explanation.
  * @param {string|null} field - Which form field is wrong (optional).
  */
 constructor(message, field = null) {
   super(message); // call the constructor using super w babaatlaha el msg 
   this.name = "InvalidInputError";
   this.field = field;
 }
}
