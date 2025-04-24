<script lang="ts">
    import { goto } from "$app/navigation";

    function goBack() {
        history.back(); // Navigate to the previous page
    }
</script>

<main
    class="relative min-h-screen w-full px-6 py-12 flex justify-center items-center bg-black overflow-hidden"
>
    <!-- Background Effects -->
    <div class="absolute inset-0 pointer-events-none z-0">
        <div
            class="absolute inset-0 bg-[size:40px_40px] bg-[linear-gradient(to_right,#4a55681a_1px,transparent_1px),linear-gradient(to_bottom,#4a55681a_1px,transparent_1px)] opacity-50"
        ></div>
        <div
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"
        ></div>
    </div>

    <!-- Content -->
    <div
        class="relative z-10 flex flex-col w-full max-w-4xl rounded-xl border border-white/10 bg-black/10 backdrop-blur-sm shadow-lg p-6"
    >
        <!-- Title -->
        <h1 class="text-3xl font-extrabold text-white mb-6 text-center">
            Privacy Policy
        </h1>

        <!-- Content Sections -->
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

        <!-- Close Button -->
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