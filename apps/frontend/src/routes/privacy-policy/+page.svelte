<script lang="ts">
    import { goto } from "$app/navigation";

    function goBack() {
        history.back(); // Navigate to the previous page
    }
</script>

<main
    class="flex min-h-screen bg-black text-white items-center justify-center p-5"
>
    <div
        class="flex flex-col w-full max-w-4xl rounded-md border border-gray-800 bg-gray-950 text-white shadow-lg p-6"
    >
        <!-- Title -->
        <h1 class="text-3xl font-semibold text-gray-200 mb-6 text-center">
            Privacy Policy
        </h1>

        <!-- Content -->
        <section class="space-y-6">
            <div>
                <h3 class="text-xl font-semibold text-gray-300 mb-2">
                    1. Introduction
                </h3>
                <p class="text-sm text-gray-400 leading-relaxed">
                    We value your privacy and are committed to complying with
                    the
                    <strong>General Data Protection Regulation (GDPR)</strong>.
                    This Privacy Policy explains how we collect, use, and
                    protect your personal data.
                </p>
            </div>

            <div>
                <h3 class="text-xl font-semibold text-gray-300 mb-2">
                    2. Data Collection & Use
                </h3>
                <p class="text-sm text-gray-400 leading-relaxed">
                    We only collect essential data necessary for your account
                    operation. This includes your
                    <strong>username, email, and game-related data</strong>. You
                    have full control over managing, editing, or deleting your
                    data at any time.
                </p>
            </div>

            <div>
                <h3 class="text-xl font-semibold text-gray-300 mb-2">
                    3. Account Deletion & Data Retention
                </h3>
                <p class="text-sm text-gray-400 leading-relaxed">
                    When you delete your account, all <strong
                        >personal data will be permanently removed</strong
                    >. However,
                    <strong>game-related data will be anonymized</strong> to maintain
                    platform integrity. This ensures your privacy while allowing
                    us to keep non-personal records for analytics and fair play.
                </p>
            </div>

            <div>
                <h3 class="text-xl font-semibold text-gray-300 mb-2">
                    4. Your Rights Under GDPR
                </h3>
                <ul
                    class="list-disc list-inside text-sm text-gray-400 space-y-2"
                >
                    <li>✔ Request access to your stored data.</li>
                    <li>✔ Modify or delete your personal information.</li>
                    <li>
                        ✔ Request <strong>anonymization</strong> of game-related
                        data.
                    </li>
                    <li>
                        ✔ Withdraw consent for data processing at any time.
                    </li>
                </ul>
            </div>

            <div>
                <h3 class="text-xl font-semibold text-gray-300 mb-2">
                    5. Contact & Support
                </h3>
                <p class="text-sm text-gray-400 leading-relaxed">
                    If you have questions about this Privacy Policy or wish to
                    exercise any of your rights, please contact our <strong
                        >support team</strong
                    >.
                </p>
            </div>
        </section>

        <div class="mt-6 text-center">
            <button
                class="bg-gray-700 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-gray-600"
                onclick={goBack}
            >
                Close
            </button>
        </div>
    </div>
</main>