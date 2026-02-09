using System;

namespace Core.Interfaces;

public interface IAIService
{
    Task<string> GetCompletionAsync(string prompt);
    Task<string> AskAiAsync(string userQuery);
}
