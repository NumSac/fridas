import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { AgentEntity, AgentStatus } from './entities/agent.entity';
import { Response } from 'express';
import { AuthType } from '../auth/enums/auth-type.enum';
import { Auth } from '../auth/decorators/auth.decorator';
import { AgentService } from './providers/agent.service';

@Controller('agents')
@Auth(AuthType.Cookie)
export class AgentsController {
  constructor(private readonly agentService: AgentService) {}

  @Get()
  public async getAgents(@Res() res: Response) {
    try {
      const agents = await this.agentService.findAll();
      return res.render('agents/index', {
        title: 'Agent Management',
        agents,
        AgentStatus,
      });
    } catch (error) {
      return res.redirect('/agents');
    }
  }

  @Get(':id')
  public async getAgent(@Param('id') id: string, @Res() res: Response) {
    try {
      const agent = await this.agentService.findOneById(id);
      if (!agent) {
        throw new NotFoundException('Agent not found');
      }

      return res.render('agents/details', {
        title: `Agent Details - ${agent.hostname}`,
        agent,
        AgentStatus, // Pass enum to template
      });
    } catch (error) {
      return res.redirect('/agents');
    }
  }

  @Delete(':id')
  public async deleteAgent(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.agentService.delete(id);
      return res.redirect('/agents');
    } catch (error) {
      return res.redirect(`/agents/${id}`);
    }
  }
}
