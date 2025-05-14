<script lang="ts">
	function goBack() {
		history.back();
	}
</script>

<main
	class="relative min-h-screen w-full px-6 py-12 flex justify-center items-center bg-black overflow-hidden"
>
	<div class="absolute inset-0 pointer-events-none z-0">
		<div
			class="absolute inset-0 bg-[size:40px_40px] bg-[linear-gradient(to_right,#4a55681a_1px,transparent_1px),linear-gradient(to_bottom,#4a55681a_1px,transparent_1px)] opacity-50"
		></div>
		<div
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"
		></div>
	</div>

	<div
		class="relative z-10 flex flex-col w-full max-w-4xl rounded-xl border border-white/10 bg-black/10 backdrop-blur-sm shadow-lg p-6"
	>
		<h1
			class="text-3xl font-extrabold text-white mb-6 text-center select-none"
		>
			Privacy Policy
		</h1>

		<section class="space-y-6">
			<div>
				<h3
					class="text-xl font-semibold text-gray-300 mb-2 select-none"
				>
					1. Introduction
				</h3>
				<p class="text-sm text-gray-400 leading-relaxed select-none">
					We value your privacy and are committed to complying with
					the
					<strong>General Data Protection Regulation (GDPR)</strong>.
					This Privacy Policy explains how we collect, use, and
					protect your personal data.
				</p>
			</div>

			<div>
				<h3
					class="text-xl font-semibold text-gray-300 mb-2 select-none"
				>
					2. Data Collection & Use
				</h3>
				<p class="text-sm text-gray-400 leading-relaxed select-none">
					We only collect essential data necessary for your account
					operation. This includes your
					<strong>username, email, and game-related data</strong>. You
					have full control over managing, editing, or deleting your
					data at any time.
				</p>
			</div>

			<div>
				<h3
					class="text-xl font-semibold text-gray-300 mb-2 select-none"
				>
					3. Account Deletion & Data Retention
				</h3>
				<p class="text-sm text-gray-400 leading-relaxed select-none">
					When you delete your account, all <strong
						>personal data will be permanently removed</strong
					>. However,
					<strong>game-related data will be anonymized</strong> to maintain
					platform integrity. This ensures your privacy while allowing
					us to keep non-personal records for analytics and fair play.
				</p>
			</div>

			<div>
				<h3
					class="text-xl font-semibold text-gray-300 mb-2 select-none"
				>
					4. Your Rights Under GDPR
				</h3>
				<ul
					class="list-disc list-inside text-sm text-gray-400 space-y-2 select-none"
				>
					<li>✔ Request access to your stored data.</li>
					<li>✔ Modify or delete your personal information.</li>
					<li>
						✔ Request <strong>anonymization</strong> of game-related
						data.
					</li>
				</ul>
			</div>

			<div>
				<h3
					class="text-xl font-semibold text-gray-300 mb-2 select-none"
				>
					5. Contact & Support
				</h3>
				<p class="text-sm text-gray-400 leading-relaxed select-none">
					If you have questions about this Privacy Policy or wish to
					exercise any of your rights, please contact our <strong
						>support team</strong
					>.
				</p>
			</div>
		</section>

		<div class="mt-6 text-center">
			<button
				class="cursor-pointer bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors duration-150 select-none px-4 py-2 rounded-md transition"
				onclick={goBack}
			>
				Close
			</button>
		</div>
	</div>
</main>
