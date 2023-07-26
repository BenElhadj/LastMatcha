<template>
    <v-container class="mt-4">
        <div class="login mt-5">
            <h1 class="page-header font-weight-light grey--text">Se connecter</h1>
            <v-form class="my-4">
                <v-text-field color="primary" class="my-5" label="Nom d'utilisateur" required></v-text-field>
                <v-text-field color="primary" class="my-5" validate-on-blur label="Mot de passe" required
                    autocomplete="off"></v-text-field>
                <v-btn block large depressed color="primary" dark class="my-5">Se connecter</v-btn>
                <v-layout row wrap justify-end>
                    <v-btn text color="primary" dark to="/forgot">Mot de passe oublié</v-btn>
                    <v-btn text color="primary" dark to="/register">S'inscrire</v-btn>
                </v-layout>
            </v-form>
        </div>
        <!-- <alert :data="alert"></alert> -->
    </v-container>
</template>
    
<script>
import vuetify from '../plugins/vuetify'
</script>
<style>
.alert-enter-active,
.alert-leave-active,
.register {
    transition: all .5s;
}

.alert-enter,
.alert-leave-to {
    opacity: 0;
}

.login,
.alert {
    width: 100%;
    max-width: 40rem;
    margin: auto;
}

.alert {
    position: absolute;
    left: 50%;
    top: 1rem;
    transform: translateX(-50%);
}

.google {
    text-decoration: none;
}
</style>