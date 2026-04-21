import { Injectable } from '@nestjs/common';
import { SourcesService } from '@sources/sources.service';
import { AutocompleteInteraction } from 'discord.js';
import { AutocompleteInterceptor } from 'necord';

@Injectable()
export class SourceAutocompleteInterceptor extends AutocompleteInterceptor {
  constructor(private readonly sourcesService: SourcesService) {
    super();
  }

  transformOptions(interaction: AutocompleteInteraction): void {
    const focused = interaction.options.getFocused(true);
    const query = focused.value.toString().toLowerCase();

    const choices = this.sourcesService
      .getAll()
      .filter((s) => s.label.toLowerCase().includes(query))
      .map((s) => ({ name: s.label, value: s.id }));

    void interaction.respond(choices);
  }
}
