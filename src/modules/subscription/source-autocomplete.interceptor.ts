import { Injectable } from '@nestjs/common';
import { Source } from '@sources/core/source';
import { AutocompleteInteraction } from 'discord.js';
import { AutocompleteInterceptor } from 'necord';

@Injectable()
export class SourceAutocompleteInterceptor extends AutocompleteInterceptor {
  transformOptions(interaction: AutocompleteInteraction): void {
    const focused = interaction.options.getFocused(true);
    const query = focused.value.toString().toLowerCase();

    const choices = Source.getAll()
      .filter((s) => s.label.toLowerCase().includes(query))
      .map((s) => ({ name: s.label, value: s.id }));

    void interaction.respond(choices);
  }
}
