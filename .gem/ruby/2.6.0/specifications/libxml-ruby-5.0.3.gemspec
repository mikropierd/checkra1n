# -*- encoding: utf-8 -*-
# stub: libxml-ruby 5.0.3 ruby lib
# stub: ext/libxml/extconf.rb

Gem::Specification.new do |s|
  s.name = "libxml-ruby".freeze
  s.version = "5.0.3"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Ross Bamform".freeze, "Wai-Sun Chia".freeze, "Sean Chittenden".freeze, "Dan Janwoski".freeze, "Anurag Priyam".freeze, "Charlie Savage".freeze, "Ryan Johnson".freeze]
  s.date = "2024-03-11"
  s.description = "    The Libxml-Ruby project provides Ruby language bindings for the GNOME\n    Libxml2 XML toolkit. It is free software, released under the MIT License.\n    Libxml-ruby's primary advantage over REXML is performance - if speed\n    is your need, these are good libraries to consider, as demonstrated\n    by the informal benchmark below.\n".freeze
  s.extensions = ["ext/libxml/extconf.rb".freeze]
  s.files = ["ext/libxml/extconf.rb".freeze]
  s.homepage = "https://xml4r.github.io/libxml-ruby/".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.5".freeze)
  s.rubygems_version = "3.0.3.1".freeze
  s.summary = "Ruby Bindings for LibXML2".freeze

  s.installed_by_version = "3.0.3.1" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<rake-compiler>.freeze, [">= 0"])
      s.add_development_dependency(%q<minitest>.freeze, [">= 0"])
    else
      s.add_dependency(%q<rake-compiler>.freeze, [">= 0"])
      s.add_dependency(%q<minitest>.freeze, [">= 0"])
    end
  else
    s.add_dependency(%q<rake-compiler>.freeze, [">= 0"])
    s.add_dependency(%q<minitest>.freeze, [">= 0"])
  end
end
