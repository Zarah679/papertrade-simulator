<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const isRegister = computed(() => route.path === '/register')

// The reactive values 
const name = ref('')
const email = ref('')
const password = ref('')


// Consume App's listeners so native form events cannot open the trade modal.
const emit = defineEmits(['select', 'confirm', 'register', 'login'])

function submitRegister() {
  emit('register', {
    name: name.value,
    email: email.value,
    password: password.value
  })

}

function submitLogin() {
  emit('login', {
    email: email.value,
    password: password.value
  })
  
}

function resetForm() {
  name.value = ''
  email.value = ''
  password.value = ''
}

</script>

<template>
  <div class="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-5xl items-center gap-8 px-5 py-10 font-figtree lg:grid-cols-2 lg:gap-16">
    <section class="rounded-3xl border border-white bg-linear-to-br from-indigo-100 to-violet-100 p-7 sm:p-10">
      <span class="inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-blue-600">PaperTrade · Practice investing</span>
      <h1 class="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Build confidence.<br />One trade at a time.</h1>
      <p class="mt-5 max-w-sm text-base leading-relaxed text-slate-500">Explore the markets, build your portfolio, and learn with simulated funds.</p>
      <div class="mt-8 rounded-2xl border border-white/80 bg-white/60 p-5">
        <p class="text-xs font-semibold tracking-wide text-slate-500">STARTING CAPITAL</p>
        <p class="mt-2 text-3xl font-bold tracking-tight text-slate-900">$10,000.00</p>
        <div class="mt-4 h-2 rounded-full bg-linear-to-r from-blue-500 to-violet-400" aria-hidden="true"></div>
        <p class="mt-3 text-sm text-slate-500">Practice funds. Real learning.</p>
      </div>
    </section>

    <section class="w-full rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="auth-title">
      <h2 id="auth-title" class="text-2xl font-bold tracking-tight text-slate-900">{{ isRegister ? 'Create your account' : 'Welcome back' }}</h2>
      <p class="mt-2 text-sm text-slate-500">{{ isRegister ? 'Start your practice portfolio with PaperTrade.' : 'Log in to continue your trading journey.' }}</p>

      <!-- UI only. Add form state and a submit handler in the next lesson. -->
      <form :key="route.path" class="mt-7 space-y-5" @submit.prevent="isRegister ? submitRegister() : submitLogin() ">
        <div v-if="isRegister">
          <label for="auth-name" class="text-sm font-medium text-slate-600">Full name</label>
          <input id="auth-name" name="name" type="text" autocomplete="name" placeholder="Your name" required class="auth-input" v-model="name"/>
        </div>
        <div>
          <label for="auth-email" class="text-sm font-medium text-slate-600">Email address</label>
          <input id="auth-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required class="auth-input" v-model="email"/>
        </div>
        <div>
          <label for="auth-password" class="text-sm font-medium text-slate-600">Password</label>
          <input id="auth-password" name="password" type="password" :autocomplete="isRegister ? 'new-password' : 'current-password'" :minlength="isRegister ? 8 : undefined" :aria-describedby="isRegister ? 'password-hint' : undefined" placeholder="Enter your password" required class="auth-input" v-model="password" />
          <p v-if="isRegister" id="password-hint" class="mt-2 text-xs text-slate-400">Use at least 8 characters.</p>
        </div>
        <button type="submit" aria-describedby="auth-preview" class="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white">{{ isRegister ? 'Create account' : 'Log in' }}</button>
        <p id="auth-preview" class="text-center text-xs text-slate-400">Form preview · account access coming soon</p>
      </form>

      <p class="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
        {{ isRegister ? 'Already have an account?' : 'New to PaperTrade?' }}
        <RouterLink :to="isRegister ? '/login' : '/register'" class="ml-1 font-semibold text-blue-600 hover:text-blue-700">{{ isRegister ? 'Log in' : 'Create an account' }}</RouterLink>
      </p>
      <RouterLink to="/" class="mt-5 block text-center text-sm text-slate-400 hover:text-slate-600">Back to dashboard</RouterLink>
    </section>
  </div>
</template>

<style scoped>
.auth-input {
  display: block;
  width: 100%;
  margin-top: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  padding: 12px 16px;
  color: #0f172a;
}
.auth-input::placeholder { color: #94a3b8; }
.auth-input:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}
a:focus-visible { outline: 2px solid #60a5fa; outline-offset: 4px; }
</style>
