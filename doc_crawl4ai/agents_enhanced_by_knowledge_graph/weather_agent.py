import os
import asyncio
import httpx
from pydantic import BaseModel, Field
from pydantic_ai import Agent, Tool

# --- Tool Definitions ---

class WeatherTool(Tool):
    """
    A tool to fetch current weather information for a given city.
    """
    city: str = Field(..., description="The name of the city to get weather for.")

    async def run(self) -> str:
        """
        Fetches weather data from a public API.
        """
        api_key = os.getenv("OPENWEATHER_API_KEY")
        if not api_key:
            return "Error: OPENWEATHER_API_KEY environment variable not set."

        base_url = "http://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": self.city,
            "appid": api_key,
            "units": "metric"  # or 'imperial' for Fahrenheit
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(base_url, params=params)
                response.raise_for_status()  # Raise an exception for HTTP errors
                data = response.json()

                if data.get("cod") == 200:
                    main = data.get("main", {})
                    weather = data.get("weather", [{}])[0]
                    wind = data.get("wind", {})

                    description = weather.get("description", "N/A")
                    temp = main.get("temp", "N/A")
                    feels_like = main.get("feels_like", "N/A")
                    humidity = main.get("humidity", "N/A")
                    wind_speed = wind.get("speed", "N/A")

                    return (
                        f"The weather in {self.city} is currently {description}. "
                        f"Temperature: {temp}°C (feels like {feels_like}°C). "
                        f"Humidity: {humidity}%. Wind speed: {wind_speed} m/s."
                    )
                else:
                    return f"Could not retrieve weather for {self.city}: {data.get('message', 'Unknown error')}"
        except httpx.RequestError as e:
            return f"Network error while fetching weather for {self.city}: {e}"
        except httpx.HTTPStatusError as e:
            return f"HTTP error while fetching weather for {self.city}: {e.response.status_code} - {e.response.text}"
        except Exception as e:
            return f"An unexpected error occurred: {e}"

# --- Agent Definition ---

class WeatherAgent(Agent):
    """
    An AI agent that can provide weather information for a given city.
    It responds in a gentle and helpful manner.
    """
    name: str = "Weather Agent"
    description: str = "A helpful AI assistant that provides current weather information."
    tools: list = [WeatherTool]

    async def run(self, query: str) -> str:
        """
        Processes the user's query and provides a gentle weather report.
        """
        # The Agent's run method handles tool calling and response generation
        # It will automatically use the defined tools if needed
        result = await super().run(query)
        
        # The result object contains the final response from the agent
        # You might need to access result.text or result.output depending on pydantic-ai version
        return result.text if hasattr(result, 'text') else str(result)

# --- Main Execution ---

async def main():
    # Ensure OPENWEATHER_API_KEY is set
    if not os.getenv("OPENWEATHER_API_KEY"):
        print("Please set the OPENWEATHER_API_KEY environment variable.")
        print("You can get one from https://openweathermap.org/api")
        return

    agent = WeatherAgent()

    print("Hello! I am your gentle Weather Agent. How can I help you today?")
    while True:
        user_query = input("You: ")
        if user_query.lower() in ["exit", "quit", "bye"]:
            print("Weather Agent: Goodbye! Have a wonderful day.")
            break
        
        response = await agent.run(user_query)
        print(f"Weather Agent: {response}")

if __name__ == "__main__":
    asyncio.run(main())
