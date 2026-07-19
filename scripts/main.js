import { world, system } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  const player = event.player;
  const item = player.getComponent("minecraft:equippable")?.getEquipment("mainhand");
  if (!item) return;
  if (item.typeId === "cbf:command_block_item") {
    event.cancel = true;
    openCommandMenu(player);
  }
});

function openCommandMenu(player) {
  const form = new ActionFormData()
    .title("§b⚙️ CONSOLE DE COMANDOS")
    .body("§6Selecione uma opção")
    .button("§e📦 Dar Items")
    .button("§6🧭 Teleportar")
    .button("§c🎮 Gamemode")
    .button("§d✨ Efeitos")
    .button("§9☀️ Clima")
    .button("§f⏰ Tempo")
    .button("§4⚔️ Dificuldade")
    .button("§g⌨️ Comando Custom");

  form.show(player).then((response) => {
    if (!response.canceled) {
      handleCommandSelection(player, response.selection);
    }
  });
}

function handleCommandSelection(player, selectedOption) {
  switch (selectedOption) {
    case 0: showGiveItemMenu(player); break;
    case 1: showTeleportMenu(player); break;
    case 2: showGamemodeMenu(player); break;
    case 3: showEffectsMenu(player); break;
    case 4: showWeatherMenu(player); break;
    case 5: showTimeMenu(player); break;
    case 6: showDifficultyMenu(player); break;
    case 7: showCustomCommandMenu(player); break;
  }
}

function showGiveItemMenu(player) {
  const form = new ModalFormData()
    .title("§e📦 DAR ITEMS")
    .textField("Item ID:", "diamond")
    .slider("Quantidade:", 1, 64, 1, 1)
    .textField("Jogador:", "");

  form.show(player).then((response) => {
    if (!response.canceled) {
      const itemId = response.formValues[0];
      const quantity = Math.floor(response.formValues[1]);
      const targetPlayer = response.formValues[2] || player.name;
      executeCommand(player, `give ${targetPlayer} ${itemId} ${quantity}`);
    }
  });
}

function showTeleportMenu(player) {
  const form = new ModalFormData()
    .title("§6🧭 TELEPORTAR")
    .textField("X:", "0")
    .textField("Y:", "64")
    .textField("Z:", "0")
    .textField("Jogador:", "");

  form.show(player).then((response) => {
    if (!response.canceled) {
      const x = response.formValues[0];
      const y = response.formValues[1];
      const z = response.formValues[2];
      const targetPlayer = response.formValues[3] || player.name;
      executeCommand(player, `tp ${targetPlayer} ${x} ${y} ${z}`);
    }
  });
}

function showGamemodeMenu(player) {
  const form = new ActionFormData()
    .title("§c🎮 GAMEMODE")
    .body("Selecione:")
    .button("Survival")
    .button("Creative")
    .button("Adventure")
    .button("Spectator");

  form.show(player).then((response) => {
    if (!response.canceled) {
      const gamemodes = ["survival", "creative", "adventure", "spectator"];
      const gamemode = gamemodes[response.selection];
      const playerForm = new ModalFormData().title("Jogador").textField("Nome:", "");
      playerForm.show(player).then((pResp) => {
        if (!pResp.canceled) {
          const targetPlayer = pResp.formValues[0] || player.name;
          executeCommand(player, `gamemode ${gamemode} ${targetPlayer}`);
        }
      });
    }
  });
}

function showEffectsMenu(player) {
  const effects = ["speed", "haste", "mining_fatigue", "strength", "instant_health", "instant_damage", "jump_boost", "nausea", "regeneration", "resistance", "fire_resistance", "water_breathing", "invisibility", "blindness", "night_vision", "hunger", "weakness", "poison", "wither", "health_boost", "absorption", "saturation", "glowing", "levitation", "slow_falling", "conduit_power", "dolphins_grace", "bad_omen", "hero_of_the_village"];
  const effectNames = ["Speed", "Haste", "Mining Fatigue", "Strength", "Instant Health", "Instant Damage", "Jump Boost", "Nausea", "Regeneration", "Resistance", "Fire Resistance", "Water Breathing", "Invisibility", "Blindness", "Night Vision", "Hunger", "Weakness", "Poison", "Wither", "Health Boost", "Absorption", "Saturation", "Glowing", "Levitation", "Slow Falling", "Conduit Power", "Dolphins Grace", "Bad Omen", "Hero of the Village"];

  const form = new ModalFormData()
    .title("§d✨ EFEITOS")
    .dropdown("Efeito:", effectNames)
    .slider("Duração (s):", 1, 3600, 1, 60)
    .slider("Nível:", 0, 255, 1, 1)
    .textField("Jogador:", "");

  form.show(player).then((response) => {
    if (!response.canceled) {
      const effect = effects[response.formValues[0]];
      const duration = Math.floor(response.formValues[1]);
      const amplifier = Math.floor(response.formValues[2]);
      const targetPlayer = response.formValues[3] || player.name;
      executeCommand(player, `effect give ${targetPlayer} ${effect} ${duration} ${amplifier} true`);
    }
  });
}

function showWeatherMenu(player) {
  const form = new ActionFormData()
    .title("§9☀️ CLIMA")
    .body("Selecione:")
    .button("Clear")
    .button("Rain")
    .button("Thunder");

  form.show(player).then((response) => {
    if (!response.canceled) {
      const weathers = ["clear", "rain", "thunder"];
      executeCommand(player, `weather ${weathers[response.selection]}`);
    }
  });
}

function showTimeMenu(player) {
  const form = new ActionFormData()
    .title("§f⏰ TEMPO")
    .body("Selecione:")
    .button("Dia")
    .button("Noite")
    .button("Amanhecer")
    .button("Anoitecer")
    .button("Customizado");

  form.show(player).then((response) => {
    if (!response.canceled) {
      if (response.selection < 4) {
        const times = ["day", "night", "sunrise", "sunset"];
        executeCommand(player, `time set ${times[response.selection]}`);
      } else {
        const customForm = new ModalFormData().title("Ticks").textField("Digite:", "0");
        customForm.show(player).then((cResp) => {
          if (!cResp.canceled) {
            executeCommand(player, `time set ${cResp.formValues[0]}`);
          }
        });
      }
    }
  });
}

function showDifficultyMenu(player) {
  const form = new ActionFormData()
    .title("§4⚔️ DIFICULDADE")
    .body("Selecione:")
    .button("Pacífico")
    .button("Fácil")
    .button("Normal")
    .button("Difícil");

  form.show(player).then((response) => {
    if (!response.canceled) {
      const difficulties = ["peaceful", "easy", "normal", "hard"];
      executeCommand(player, `difficulty ${difficulties[response.selection]}`);
    }
  });
}

function showCustomCommandMenu(player) {
  const form = new ModalFormData()
    .title("§g⌨️ COMANDO CUSTOM")
    .textField("Digite (sem /):", "");

  form.show(player).then((response) => {
    if (!response.canceled) {
      const command = response.formValues[0];
      if (command.trim() !== "") {
        executeCommand(player, command);
      }
    }
  });
}

function executeCommand(player, command) {
  try {
    system.run(() => {
      try {
        world.getDimension("overworld").runCommand(command);
        player.sendMessage(`§a✓ Comando: /${command}`);
      } catch (error) {
        player.sendMessage(`§c✗ Erro: ${error}`);
      }
    });
  } catch (error) {
    player.sendMessage(`§c✗ Erro: ${error}`);
  }
}

console.warn("§6[Command Block] Carregado!");
