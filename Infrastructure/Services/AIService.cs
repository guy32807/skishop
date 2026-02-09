using System;
using Core.Interfaces;

namespace Infrastructure.Services;

public class AIService : IAIService
{
    public Task<string> AskAiAsync(string userQuery)
    {
        throw new NotImplementedException();
    }

    public Task<string> GetCompletionAsync(string prompt)
    {
        throw new NotImplementedException();
    }
}
