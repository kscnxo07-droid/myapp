<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div class="container">
        <a class="navbar-brand fw-bold" href="#">藥物交互檢查系統</a>
        <div class="navbar-nav ms-auto">
          <router-link class="nav-link" to="/patient">病人端 - 用藥查詢</router-link>
          <router-link class="nav-link" to="/ehr">醫師端 - 處方輔助</router-link>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>