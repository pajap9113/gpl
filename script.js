const applicationForm = document.getElementById("application-form");
const phoneInput = document.getElementById("phone");
const phoneFull = document.getElementById("phone-full");
const submitButton = applicationForm?.querySelector('button[type="submit"]');

const COOLDOWN_TIME = 60 * 1000;
const LAST_SUBMISSION_KEY = "gpl_last_application";

if (applicationForm && phoneInput && phoneFull) {
    phoneInput.addEventListener("input", () => {
        phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
    });

    applicationForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const lastSubmission = Number(
                localStorage.getItem(LAST_SUBMISSION_KEY) || 0
            );

            const remainingTime =
                COOLDOWN_TIME - (Date.now() - lastSubmission);

            if (remainingTime > 0) {
                const seconds = Math.ceil(remainingTime / 1000);

                alert(
                    `Please wait ${seconds} seconds before submitting another application.`
                );

                return;
            }
        } catch (error) {
            console.warn("Could not check submission cooldown.", error);
        }

        const phone = phoneInput.value;
        const usPhonePattern = /^[2-9]\d{2}[2-9]\d{6}$/;

        if (!usPhonePattern.test(phone)) {
            alert("Please enter a valid 10-digit US phone number.");
            phoneInput.focus();
            return;
        }

        phoneFull.value = `+1${phone}`;

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const formData = new FormData(applicationForm);

            const response = await fetch(
                "https://api.web3forms.com/submit",
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    result.body?.message ||
                    "Something went wrong. Please try again."
                );
            }

            try {
                localStorage.setItem(
                    LAST_SUBMISSION_KEY,
                    Date.now().toString()
                );
            } catch (error) {
                console.warn("Could not save submission cooldown.", error);
            }

            showSuccessPopup();

        } catch (error) {
            alert(
                error.message ||
                "Unable to submit your application. Please try again."
            );

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}


const scrollToTopButton = document.getElementById("scrollToTop");

if (scrollToTopButton) {
    window.addEventListener("scroll", () => {
        scrollToTopButton.classList.toggle(
            "visible",
            window.scrollY > 180
        );
    });

    scrollToTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}


const successPopup = document.getElementById("success-popup");
const popupOk = document.getElementById("popup-ok");
const popupClose = document.getElementById("popup-close");

function showSuccessPopup() {
    if (successPopup) {
        document.body.classList.add("popup-open");
        successPopup.showModal();
    }
}

function closeSuccessPopup() {
    if (successPopup?.open) {
        successPopup.close();
    }
}

if (successPopup) {
    successPopup.addEventListener("close", () => {
        applicationForm?.reset();
        document.body.classList.remove("popup-open");
    });
}

popupOk?.addEventListener("click", closeSuccessPopup);
popupClose?.addEventListener("click", closeSuccessPopup);