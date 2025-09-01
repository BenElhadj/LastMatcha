#!/bin/bash
echo "🚮 Nettoyage des dépendances et builds..."

# Supprimer node_modules + package-lock dans frontend
rm -rf ./frontend/node_modules
echo "🚮 ./frontend/node_modules est supprimer ✅"
rm -rf ./frontend/package-lock.json
echo "🚮 frontend/package-lock.json est supprimer ✅"
rm -rf ./frontend/dist
echo "🚮 ./frontend/dist est supprimer ✅"
echo "🚮 Le frontend est bien nettoyer ✅✅✅"

# Supprimer node_modules + package-lock dans backend
rm -rf ./backend/node_modules
echo "🚮  est supprimer ✅"
rm -rf ./backend/package-lock.json
echo "🚮 ./backend/package-lock.json est supprimer ✅"
rm -rf ./backend/build
echo "🚮 ./backend/build est supprimer ✅"
echo "🚮 Le backend bein est nettoyer ✅✅✅"
echo "✅ Nettoyage terminé !✅"
