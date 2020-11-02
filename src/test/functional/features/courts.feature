Feature: Homepage

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials "hmcts.fact@gmail.com" "Pa55word11"
    And click the Sign In button

  Scenario: View the list
    Then I can view the courts or tribunals in a list format
    And they are in alphabetical order

  Scenario Outline: View a court profile page
    When I click view next to court with "<view_court_slug>"
    Then I am directed to the court profile page

    Examples:
      | view_court_slug                            |
      | abergavenny-magistrates-court |

  Scenario Outline: Navigate to edit a court or tribunal page
    When I click edit next to court with "<edit_court_slug>"
    Then I am redirected to the Edit Court page for the "<edit_court_name>"

    Examples:
      | edit_court_slug                            | edit_court_name                            |
      | birmingham-civil-and-family-justice-centre | Birmingham Civil and Family Justice Centre |
