import { SourceId } from '@entities/subscription.entity';
import { Injectable } from '@nestjs/common';
import * as Constants from '@sources/codexygo/codexygo.constants';
import { Source } from '@sources/core/abstract-source';

@Injectable()
export class CodexYGOSource extends Source {
  readonly id = SourceId.CodexYGO;
  readonly label = Constants.CODEXYGO_LABEL;
  readonly description = Constants.CODEXYGO_DESCRIPTION;
  readonly url = Constants.CODEXYGO_WEBSITE_BASE_URL;
}
