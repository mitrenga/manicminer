<?php

require_once 'app/svision/php/abstractAboutPage.php';

/**
 * The /about page: the story of the original Manic Miner and this remake,
 * with links to Wikipedia, the Spectrum Computing archive and Retro Games.
 */
class AboutPage extends AbstractAboutPage {

  protected function aboutData() {
    return [
      'image' => 'images/cover.png',
      'sections' => [
        [
          'heading' => 'The original game (1983)',
          'html' =>
            '<p>Manic Miner is one of the most famous platform games of the 8-bit era, written by the '.
            'teenage bedroom coder Matthew Smith for the ZX Spectrum. It was first published by Bug-Byte '.
            'in 1983 and later re-released by Software Projects, the company Smith co-founded. It was one '.
            'of the first Spectrum games with continuous in-game music, and its mix of precise jumps, '.
            'surreal enemies and twenty deadly caverns defined the British platformer.</p>'.
            '<p>As Miner Willy you explore twenty perilous caverns deep below Surbiton, collecting the '.
            'flashing keys and reaching the exit before the oxygen runs out — while avoiding poisonous '.
            'plants, crushing stalactites and bizarre creatures like the infamous Mutant Telephones.</p>',
        ],
        [
          'heading' => 'This remake',
          'html' =>
            '<p>This is a faithful remake of the later Software Projects release. It runs directly in '.
            'your web browser — there is nothing to install and nothing to download, just open the page '.
            'and play, free of charge. The game supports keyboard, touch controls and gamepads.</p>',
        ],
      ],
      'links' => [
        ['label' => 'Manic Miner on Wikipedia', 'url' => 'https://en.wikipedia.org/wiki/Manic_Miner'],
        ['label' => 'Matthew Smith on Wikipedia', 'url' => 'https://en.wikipedia.org/wiki/Matthew_Smith_(games_programmer)'],
        ['label' => 'Original game archive (TZX) on Spectrum Computing', 'url' => 'https://spectrumcomputing.co.uk/entry/3012/ZX-Spectrum/Manic_Miner'],
        ['label' => 'Retro Games — more classic remakes playable in your browser', 'url' => 'https://retrogames.free/'],
      ],
      'footer' =>
        '<p>An unofficial fan remake. The original game and its artwork belong to their authors. '.
        'Remake source code is available on <a href="https://github.com/mitrenga/manicminer" target="_blank" rel="noopener">GitHub</a>.</p>',
    ];
  } // aboutData

} // AboutPage
