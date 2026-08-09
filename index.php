<?php
  $appName = 'MANIC MINER';
  $appDescription = 'Play MANIC MINER online for free in your browser. Faithful remake of the legendary 1983 ZX Spectrum platform game with no download required.';
  $appPrefix = 'mm';
  $appNoscript =
    '<h1>MANIC MINER</h1>'.
    '<p>Manic Miner is one of the most famous platform games of the 8-bit era, created by Matthew Smith '.
    'for the ZX Spectrum in 1983. It was first published by Bug-Byte and later re-released by Software '.
    'Projects. As Miner Willy you explore twenty perilous caverns deep below Surbiton, collecting the '.
    'flashing keys and reaching the exit before the oxygen runs out — while avoiding poisonous plants, '.
    'crushing stalactites and bizarre creatures like the infamous Mutant Telephones.</p>'.
    '<p>This is a faithful remake of the later Software Projects release that runs directly in your web browser. '.
    'There is nothing to install and nothing to download — just open the page and play. '.
    'Please enable JavaScript to start the game.</p>';
  $appOpenGraph = [
    'image' => 'images/poster.png',
  ];
  $appJsonLd = [
    'genre' => 'Platform game',
    'isBasedOn' => [
      '@type' => 'VideoGame',
      'name' => 'Manic Miner',
      'author' => ['@type' => 'Person', 'name' => 'Matthew Smith'],
      'publisher' => [
        ['@type' => 'Organization', 'name' => 'Bug-Byte'],
        ['@type' => 'Organization', 'name' => 'Software Projects'],
      ],
      'datePublished' => '1983',
      'gamePlatform' => 'ZX Spectrum',
    ],
  ];
  require_once 'config/config.php';
  require_once 'app/svision/php/main.php';
