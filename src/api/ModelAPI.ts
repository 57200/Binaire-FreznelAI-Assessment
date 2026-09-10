export class ModelAPI {
  private readonly url = "/api/hf-models-api.json";

  fetchModels() {
    return fetch(this.url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch models");
        }
        return response.json();
      })
      .then((data) => data.models);
  }
}