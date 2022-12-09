@fact-admin-tab-postcodes @fact-admin-tab-types
Feature: Postcodes order

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    When I click edit next to court with "birmingham-civil-and-family-justice-centre"
    Then I am redirected to the Edit Court page for the chosen court
    And I hover over types nav element
    When I click the types tab
    And I will make sure County court type is selected
    When I click the postcodes tab


  Scenario: validate that postcodes should appear in alpha numeric order
    Then I can see the court postcodes appear in alpha numeric order
