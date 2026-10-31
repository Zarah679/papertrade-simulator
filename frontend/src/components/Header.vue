<script setup>
import { RouterLink } from 'vue-router'

const LINKS = ['Trade', 'Portfolio', 'Watchlist', 'Leaderboard']

</script>

<template>
    <nav
        class="
            fixed top-0 left-0 z-50
            w-full
            border-b border-white/20
            bg-white/60
            backdrop-blur-xl
        "
        >
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
            <!-- Logo -->
            <RouterLink to="/">PaperTrade</RouterLink>

            <!-- Links -->
            <div class="flex gap-3 overflow-x-auto text-sm sm:gap-6">
                <RouterLink to="/trading" active-class="text-blue-600">Trade</RouterLink>
                <RouterLink to="/markets" active-class="text-blue-600">Markets</RouterLink>
                <a href="#">Portfolio</a>
                <a href="#">Watchlist</a>
                <a href="#">Leaderboards</a>
            </div>

            <!-- Account -->
            <RouterLink to="/login" class="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Log in</RouterLink>
        </div>
</nav>
</template>

<style scoped>
</style>
